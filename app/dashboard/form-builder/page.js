"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

// Mock implementation of react-beautiful-dnd for simplicity
// In a real app, you would install and use the actual library
// const DragDropContext = ({ children, onDragEnd }) => {
//   return <div>{children}</div>
// }

// const Droppable = ({ children, droppableId }) => {
//   return <div>{children({ droppableProps: {}, innerRef: null, placeholder: null })}</div>
// }

// const Draggable = ({ children, draggableId, index }) => {
//   return <div>{children({ draggableProps: {}, dragHandleProps: {}, innerRef: null })}</div>
// }

export default function FormBuilderPage() {
  const router = useRouter()
  const [fields, setFields] = useState([])
  const [newField, setNewField] = useState({
    name: "",
    label: "",
    type: "text",
    required: false,
    options: [],
  })
  const [newOption, setNewOption] = useState("")

  useEffect(() => {
    // Load existing form fields
    const storedFields = localStorage.getItem("transactionFormFields")
    if (storedFields) {
      setFields(JSON.parse(storedFields))
    }
  }, [])

  const handleAddField = () => {
    if (newField.name.trim() === "" || newField.label.trim() === "") {
      alert("Nama dan label field harus diisi")
      return
    }

    // Create a new field with a unique ID
    const fieldToAdd = {
      ...newField,
      id: Date.now(),
      name: newField.name.replace(/\s+/g, "").toLowerCase(),
    }

    // Add the new field to the list
    const updatedFields = [...fields, fieldToAdd]
    setFields(updatedFields)

    // Save to localStorage
    localStorage.setItem("transactionFormFields", JSON.stringify(updatedFields))

    // Reset the form
    setNewField({
      name: "",
      label: "",
      type: "text",
      required: false,
      options: [],
    })
  }

  const handleRemoveField = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus field ini?")) {
      const updatedFields = fields.filter((field) => field.id !== id)
      setFields(updatedFields)
      localStorage.setItem("transactionFormFields", JSON.stringify(updatedFields))
    }
  }

  const handleAddOption = () => {
    if (newOption.trim() === "") return

    setNewField({
      ...newField,
      options: [...newField.options, newOption],
    })

    setNewOption("")
  }

  const handleRemoveOption = (index) => {
    const updatedOptions = [...newField.options]
    updatedOptions.splice(index, 1)

    setNewField({
      ...newField,
      options: updatedOptions,
    })
  }

  const handleMoveField = (id, direction) => {
    const index = fields.findIndex((field) => field.id === id)
    if ((direction === "up" && index === 0) || (direction === "down" && index === fields.length - 1)) {
      return
    }

    const newIndex = direction === "up" ? index - 1 : index + 1
    const updatedFields = [...fields]
    const [movedField] = updatedFields.splice(index, 1)
    updatedFields.splice(newIndex, 0, movedField)

    setFields(updatedFields)
    localStorage.setItem("transactionFormFields", JSON.stringify(updatedFields))
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return

    const items = Array.from(fields)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setFields(items)
    localStorage.setItem("transactionFormFields", JSON.stringify(items))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href="/dashboard/transactions">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Form Builder</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tambah Field Baru</CardTitle>
            <CardDescription>Buat field baru untuk form transaksi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="fieldName">Nama Field</Label>
              <Input
                id="fieldName"
                value={newField.name}
                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                placeholder="Contoh: invoiceNumber"
              />
              <p className="text-xs text-muted-foreground">Nama field untuk digunakan dalam sistem (tanpa spasi)</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fieldLabel">Label Field</Label>
              <Input
                id="fieldLabel"
                value={newField.label}
                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                placeholder="Contoh: Nomor Invoice"
              />
              <p className="text-xs text-muted-foreground">Label yang akan ditampilkan kepada pengguna</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fieldType">Tipe Field</Label>
              <Select value={newField.type} onValueChange={(value) => setNewField({ ...newField, type: value })}>
                <SelectTrigger id="fieldType">
                  <SelectValue placeholder="Pilih tipe field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="select">Select (Dropdown)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="required"
                checked={newField.required}
                onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
              />
              <Label htmlFor="required">Wajib diisi</Label>
            </div>

            {newField.type === "select" && (
              <div className="space-y-4 border-t pt-4">
                <Label>Opsi Dropdown</Label>

                {newField.options.length > 0 && (
                  <div className="space-y-2">
                    {newField.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1 bg-muted p-2 rounded-md">{option}</div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveOption(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Tambah opsi baru"
                  />
                  <Button type="button" onClick={handleAddOption}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddField} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Field
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Field yang Ada</CardTitle>
            <CardDescription>Kelola field yang ada dalam form transaksi</CardDescription>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="fields">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {fields.length > 0 ? (
                      fields.map((field, index) => (
                        <Draggable key={field.id} draggableId={field.id.toString()} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="border rounded-md p-4"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-medium">{field.label}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {field.name} ({field.type}){field.required && " - Wajib"}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleMoveField(field.id, "up")}
                                    disabled={index === 0}
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleMoveField(field.id, "down")}
                                    disabled={index === fields.length - 1}
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleRemoveField(field.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {field.type === "select" && field.options && field.options.length > 0 && (
                                <div className="mt-2 text-sm">
                                  <p className="text-muted-foreground">Opsi:</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {field.options.map((option, i) => (
                                      <span key={i} className="bg-muted px-2 py-1 rounded-md text-xs">
                                        {option}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">Belum ada field yang ditambahkan</div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/transactions")}>
              Selesai
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
