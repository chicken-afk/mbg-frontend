"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowDown, ArrowUp, Plus, Trash2, Edit2, Edit2Icon } from "lucide-react"
import Link from "next/link"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import axios from "axios"
import { useProject } from "@/contexts/ProjectContext"

export default function FormBuilderPage() {
  const router = useRouter()
  const { activeProject } = useProject()
  const [fields, setFields] = useState([])
  const [newField, setNewField] = useState({
    id: null,
    name: "",
    label: "",
    type: "text",
    required: false,
    options: [],
    warehouse_id: activeProject.id || null,
  })
  const [newOption, setNewOption] = useState("")
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [isAdd, setIsAdd] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    setFields([])
    const token = localStorage.getItem("token")
    if (activeProject.id === undefined || activeProject.id === null) {
      console.log("No active project found")
      setIsLoading(false)
      return
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const response = await axios.get(`${apiUrl}/api/form-fields?warehouse_id=${activeProject.id}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
    if (response.status === 200 && response.data && response.data.length > 0) {
      //Mapping the response data to match the expected format
      const mappedFields = response.data.map((field) => ({
        id: field.id,
        name: field.name,
        label: field.label,
        type: field.type,
        required: field.required,
        options: field.options || [],
      }))
      setFields(mappedFields)
    }
    setIsLoading(false)
  };

  const handleEditField = (field) => {
    setIsAdd(false)
    setNewField({
      id: field.id,
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      options: field.options || [],
      warehouse_id: activeProject.id || null,
    })
    setNewOption("")
    setFields(fields.filter((f) => f.id !== field.id))
    setMessage(null)
    setError(null)
    setSubmitting(false)
  }

  const resetAllForm = () => {
    setIsAdd(true)
    setNewField({
      id: null,
      name: "",
      label: "",
      type: "text",
      required: false,
      options: [],
      warehouse_id: activeProject.id || null,
    })
    setNewOption("")
    setMessage(null)
    setError(null)
    setSubmitting(false)
    setFields(fields.filter((f) => f.id !== newField.id))
  }

  useEffect(() => {
    fetchData()
    if (activeProject || activeProject.id !== undefined) {
      console.log("Active project found:", activeProject)
      resetAllForm()
    }
    // Load existing form fields
    // const storedFields = localStorage.getItem("transactionFormFields")
    // if (storedFields) {
    //   setFields(JSON.parse(storedFields))
    // }
  }, [activeProject])

  const handleAddField = async () => {
    setError(null)
    setMessage(null)
    if (newField.label.trim() === "") {
      alert("Nama field harus diisi")
      setError("Nama field harus diisi")
      return
    }
    setSubmitting(true)
    newField.name = newField.label

    // Create a new field with a unique ID
    const fieldToAdd = {
      ...newField,
      id: newField.id ?? null,
      name: newField.name.replace(/\s+/g, "").toLowerCase(),
    }

    //Post the new field to the server
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const token = localStorage.getItem("token")

    try {
      const response = await axios.post(`${apiUrl}/api/form-fields`, fieldToAdd, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Field added successfully:", response.data)
      // Update the local state with the new field
      fetchData()
      setMessage("Field added successfully")
      setIsAdd(true)
      // const updatedFields = [...fields, fieldToAdd]
    } catch (error) {
      console.error("Error adding field:", error)
      alert("Gagal menambahkan field")
      setError("Gagal menambahkan field")
      setSubmitting(false)
      return
    }

    // Reset the form
    setNewField({
      name: "",
      label: "",
      type: "text",
      required: false,
      options: [],
    })
    setSubmitting(false)
  }

  const handleRemoveField = async (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus field ini?")) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const token = localStorage.getItem("token")
      try {
        const response = await axios.delete(`${apiUrl}/api/form-fields/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        console.log("Field deleted successfully:", response.data)
        fetchData()
      } catch (error) {
        console.error("Error deleting field:", error)
        alert("Gagal menghapus field")
      }
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
  const handleBackButton = () => {
    fetchData()
    setIsAdd(true)
    setNewField({
      id: null,
      name: "",
      label: "",
      type: "text",
      required: false,
      options: [],
    })
    setNewOption("")
    setMessage(null)
    setError(null)
    setSubmitting(false)
    setFields(fields.filter((f) => f.id !== newField.id))
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
            {
              isAdd ? (
                <>
                  <CardTitle>Tambah Field Baru</CardTitle>
                  <CardDescription>Buat field baru untuk form transaksi</CardDescription>
                </>
              ) : (
                <>
                  <CardTitle>
                    <Button variant="ghost" size="icon" onClick={handleBackButton}>
                      <ArrowLeft className="h-4 w-4 mr-2 mb-2" />
                    </Button>
                    Edit Field
                  </CardTitle>
                  <CardDescription>Edit field untuk form transaksi</CardDescription>
                </>
              )
            }
            {message && <p className="text-sm text-green-500">{message}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardHeader>
          <CardContent className="space-y-4">

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
            {submitting || activeProject.id === undefined || activeProject.id === null ? (
              <Button disabled className="w-full">
                <span className="animate-pulse">Loading...</span>
              </Button>
            ) : (
              <Button onClick={handleAddField} className="w-full">
                {isAdd ? <>
                  <Plus className="mr-2 h-4 w-4" />
                </> : <>
                  <Edit2 className="mr-2 h-4 w-4" />
                </>
                }
                {isAdd ? "Simpan" : "Simpan Perubahan"}
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Field Dinamis yang Ada</CardTitle>
            <CardDescription>Kelola field yang ada dalam form transaksi</CardDescription>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="fields">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {fields.length > 0 && !isLoading ? (
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
                                  <Button type="button" variant="ghost" size="icon" onClick={() => handleEditField(field)}>
                                    <Edit2Icon className="h-4 w-4" />
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
                      isLoading || activeProject.id === undefined ? (
                        <div className="text-center py-8 text-muted-foreground animate-pulse">Loading...</div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">Tidak ada field yang ditemukan</div>
                      )
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
