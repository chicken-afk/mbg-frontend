"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import axios from "axios"

export default function AddTransactionPage() {
  const router = useRouter()
  const [formFields, setFormFields] = useState([])
  const [customFields, setCustomFields] = useState([])

  const [formattedAmount, setFormattedAmount] = useState("")
  const [submiting, setSubmitting] = useState(false)

  const formatRupiah = (value) => {
    const numberString = value.replace(/[^\d]/g, "")
    const number = parseInt(numberString, 10)
    if (isNaN(number)) return ""
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number)
  }

  const parseRupiah = (formattedValue) => {
    return formattedValue.replace(/[^\d]/g, "")
  }

  const fetchCustomFields = async () => {
    setSubmitting(true)
    const token = localStorage.getItem("token")
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await axios.get(`${apiUrl}/api/form-fields?status=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      const mappedFields = response.data.map((field) => ({
        id: field.id,
        name: field.name,
        label: field.label,
        type: field.type,
        options: field.options ? field.options : [],
        required: field.required,
      }))
      setCustomFields(mappedFields)
      // setCustomFields(response.data)
    } catch (error) {
      // Handle error 401
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("isAuthenticated")
        router.push("/?forceLogout=true")
        return
      }
      console.error("Error fetching custom fields:", error)
    }
    setSubmitting(false)
  }


  useEffect(() => {
    // Load form fields from localStorage
    // Default fields if none exist
    fetchCustomFields()
    const defaultFields = [
      { id: 1, name: "date", label: "Tanggal", type: "date", required: true },
      { id: 2, name: "description", label: "Deskripsi", type: "text", required: true },
      { id: 3, name: "Jumlah", label: "Jumlah (Rp.)", type: "number", required: true },
      {
        id: 4,
        name: "category",
        label: "Kategori",
        type: "select",
        options: ["Pemasukan", "Pengeluaran"],
        required: true,
      },
      {
        id: 5,
        name: "status",
        label: "Status",
        type: "select",
        options: ["Selesai"],
        required: true,
      },
      {
        id: 6,
        name: "paymentMethod",
        label: "Metode Pembayaran",
        type: "select",
        options: ["Cash", "Transfer Bank"],
        required: true,
      }
    ]
    setFormFields(defaultFields)
  }, [])

  const handleSubmit = async (e) => {
    setSubmitting(true)
    e.preventDefault()

    // Get form data
    const formData = new FormData(e.target)
    const transactionData = {
      id: Date.now(), // Simple ID generation
      date: formData.get("date"),
      description: formData.get("description"),
      amount:
        formData.get("category") === "Pengeluaran"
          ? -Math.abs(Number(parseRupiah(formattedAmount)))
          : Math.abs(Number(parseRupiah(formattedAmount))),
      category: formData.get("category"),
      status: formData.get("status"),
      paymentMethod: formData.get("paymentMethod"),
      notes: formData.get("notes"),
      customFields: [],
    }


    // Add custom fields
    customFields.forEach((field) => {
      // const fieldName = field.name
      // transactionData.customFields[fieldName] = formData.get(`custom_${fieldName}`)
      var selectedValue = ""
      if (field.type === "select") {
        //get selected value
        selectedValue = formData.get(`custom_${field.name}`)
        console.log("field name:", `custom_${field.name}`)
        console.log("Selected value:", selectedValue)
      } else {
        selectedValue = formData.get(`custom_${field.name}`)
      }
      transactionData.customFields.push({
        key: field.name,
        label: field.label,
        value: selectedValue,
      })
    })
    console.log("Transaction data:", transactionData)
    //post data using axios
    const token = localStorage.getItem("token")
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = axios.post(
        `${apiUrl}/api/transactions`,
        transactionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      console.log("Transaction saved successfully:", response.data)
    } catch (error) {
      // Handle error 401
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("isAuthenticated")
        router.push("/?forceLogout=true")
        return
      }
      console.error("Error saving transaction:", error)
    }
    setSubmitting(false)
    // Redirect back to transactions list
    router.push("/dashboard/transactions")
  }

  const renderField = (field) => {
    if (field.name === "Jumlah") {
      return (
        <Input
          id={field.name}
          name="amount"
          value={formattedAmount}
          onChange={(e) => setFormattedAmount(formatRupiah(e.target.value))}
          required={field.required}
          placeholder="Rp. 0"
        />
      )
    }

    switch (field.type) {
      case "text":
        return <Input id={field.name} name={field.name} required={field.required} />
      case "number":
        return <Input id={field.name} name={field.name} type="number" required={field.required} />
      case "date":
        return <Input id={field.name} name={field.name} type="date" required={field.required} />
      case "textarea":
        return <Textarea id={field.name} name={field.name} required={field.required} />
      case "select":
        return (
          <Select name={field.name} required={field.required}>
            <SelectTrigger>
              <SelectValue placeholder={`Pilih ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option, i) => (
                <SelectItem key={i} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      default:
        return <Input id={field.name} name={field.name} />
    }
  }

  const renderCustomField = (field) => {
    switch (field.type) {
      case "text":
        return <Input id={`custom_${field.name}`} name={`custom_${field.name}`} required={field.required} />
      case "number":
        return <Input id={`custom_${field.name}`} name={`custom_${field.name}`} type="number" required={field.required} />
      case "date":
        return <Input id={`custom_${field.name}`} name={`custom_${field.name}`} type="date" required={field.required} />
      case "textarea":
        return <Textarea id={`custom_${field.name}`} name={`custom_${field.name}`} required={field.required} />
      case "select":
        return (
          <Select name={`custom_${field.name}`} required={field.required}>
            <SelectTrigger>
              <SelectValue placeholder={`Pilih ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option, i) => (
                <SelectItem key={i} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      default:
        return <Input id={`custom_${field.name}`} name={`custom_${field.name}`} required={field.required} />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href="/dashboard/transactions">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Tambah Transaksi</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Transaksi</CardTitle>
          <CardDescription>Isi informasi transaksi keuangan baru</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Standard Fields */}
            {formFields.map((field) => (
              <div key={field.id} className="grid gap-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && " *"}
                </Label>
                {renderField(field)}
              </div>
            ))}

            {/* Custom Fields */}
            {customFields.length > 0 && (
              <div className="border-t pt-4 mt-6">
                <h3 className="text-lg font-medium mb-4">Informasi Tambahan</h3>
                {customFields.map((field) => (
                  <div key={field.id} className="grid gap-2 mb-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`custom_${field.name}`}>{field.label} {field.required && " *"}</Label>
                    </div>
                    {renderCustomField(field)}
                  </div>
                ))}
              </div>
            )}

          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/dashboard/transactions">
              <Button variant="outline">Batal</Button>
            </Link>
            {submiting ? (
              <Button variant="outline" disabled>
                <Plus className="animate-pulse" />
              </Button>
            ) : (
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Transaksi
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
