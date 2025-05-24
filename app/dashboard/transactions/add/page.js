"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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

  const [invoiceFile, setInvoiceFile] = useState(null)
  const [invoiceFileName, setInvoiceFileName] = useState("")
  const [error, setError] = useState("")
  const [errorFile, setErrorFile] = useState("")
  const [isEdit, setIsEdit] = useState(false)
  const [transactionId, setTransactionId] = useState(null)
  const [transactionData, setTransactionData] = useState(null)

  const [isLoading, setIsLoading] = useState(false)

  const searchParams = useSearchParams();

  useEffect(() => {
    const paramUUid = searchParams.get("transaction_uuid");
    const paramEdit = searchParams.get("isEdit");
    setTransactionId(paramUUid);
    setIsEdit(paramEdit);
    if (isEdit) {
      try {
        setIsLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const token = localStorage.getItem("token")
        axios.get(`${apiUrl}/api/transactions/${paramUUid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).then((response) => {
          console.log("Transaction data:", response.data.data)
          //Map response data to form fields
          const data = response.data.data
          setTransactionData(data)
          console.log("Transaction data:", data)
          //if data amount is negatif set positive
          if (data.amount < 0) {
            data.amount = -data.amount
          }
          setTransactionData(data)
          setFormattedAmount(formatRupiah(data.amount.toString()))
          setSubmitting(false)
          setIsLoading(false)
          console.log("is loadinggg", isLoading)
        })
      } catch (error) {
        // Handle error 401
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("isAuthenticated")
          router.push("/?forceLogout=true")
          return
        }
        console.error("Error fetching transaction data:", error)
        setIsLoading(false)
      }
    }

  }, [isEdit]);

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
  }, [])

  const handleSubmit = async () => {
    setSubmitting(true)

    // Get form data
    const formData = new FormData(document.getElementById("transaction-form"))
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
      invoiceFileBase64: invoiceFile,
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
    transactionData.id = isEdit ? transactionId : null
    // console.log("Transaction data:", transactionData)
    // setSubmitting(false)
    // return transactionData;
    //post data using axios
    const token = localStorage.getItem("token")
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await axios.post(
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
      if (error.response && error.response.status === 422) {
        setError(error.response.data.message)
      }

      setSubmitting(false)
      console.error("Error saving transaction:", error)
      return
    }
    setSubmitting(false)
    // Redirect back to transactions list
    router.push("/dashboard/transactions?from=form")
  }

  const renderCustomField = (field) => {
    switch (field.type) {
      case "text":
        return <Input defaultValue={field?.value} id={`custom_${field.name}`} name={`custom_${field.name}`} required={field.required} />
      case "number":
        return <Input defaultValue={field?.value} id={`custom_${field.name}`} name={`custom_${field.name}`} type="number" required={field.required} />
      case "date":
        return <Input defaultValue={field?.value} id={`custom_${field.name}`} name={`custom_${field.name}`} type="date" required={field.required} />
      case "textarea":
        return <Textarea defaultValue={field?.value} id={`custom_${field.name}`} name={`custom_${field.name}`} required={field.required} />
      case "select":
        return (
          <Select defaultValue={field?.value} name={`custom_${field.name}`} required={field.required}>
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
        return <Input defaultValue={field?.value} id={`custom_${field.name}`} name={`custom_${field.name}`} required={field.required} />
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
        <h1 className="text-3xl font-bold tracking-tight">{
          isEdit ? "Edit Transaksi" : "Tambah Transaksi"
        }</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Transaksi</CardTitle>
          <CardDescription>
            {isEdit ? transactionId : "Isi informasi transaksi keuangan baru"}
          </CardDescription>
        </CardHeader>
        {!isLoading ? <>
          <form id="transaction-form">
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium">Tanggal Transaksi</label>
                <span className="text-xs text-red-600 ms-1">*Wajib Diisi</span>
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  defaultValue={
                    isEdit && transactionData?.transaction_at
                      ? new Date(transactionData.transaction_at).toISOString().slice(0, 10)
                      : ""
                  }
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Deskripsi */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Deskripsi</label>
                <span className="text-xs text-red-600 ms-1">*Wajib Diisi</span>
                <input
                  id="description"
                  name="description"
                  type="text"
                  required
                  defaultValue={isEdit ? transactionData?.description || "" : ""}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Jumlah (Rp.) */}
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">Jumlah (Rp.)</label>
                <span className="text-xs text-red-600 ms-1">*Wajib Diisi</span>
                <input
                  id="Jumlah"
                  name="amount"
                  required
                  placeholder="Rp. 0"
                  value={formattedAmount}
                  onChange={(e) => setFormattedAmount(formatRupiah(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Kategori */}
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Kategori</label>
                <span className="text-xs text-red-600 ms-1">*Wajib Diisi</span>
                <select
                  name="category"
                  id="category"
                  required
                  defaultValue={
                    isEdit
                      ? transactionData?.type
                        ? transactionData.type.charAt(0).toUpperCase() + transactionData.type.slice(1)
                        : ""
                      : ""
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Pemasukan">Pemasukan</option>
                  <option value="Pengeluaran">Pengeluaran</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <select
                  name="status"
                  id="status"
                  required
                  defaultValue={formFields.find(f => f.name === "status")?.value || "selesai"}
                  className="w-full p-2 border rounded"
                >
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              {/* Metode Pembayaran */}
              <div className="space-y-2">
                <label htmlFor="paymentMethod" className="text-sm font-medium">Metode Pembayaran</label>
                <span className="text-xs text-red-600 ms-1">*Wajib Diisi</span>
                <select
                  name="paymentMethod"
                  id="paymentMethod"
                  required
                  defaultValue={isEdit ? (transactionData?.payment_method
                    ? transactionData.payment_method.charAt(0).toUpperCase() + transactionData.payment_method.slice(1)
                    : "") : ""}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Pilih Metode Pembayaran</option>
                  <option value="Cash">Cash</option>
                  <option value="Transfer Bank">Transfer Bank</option>
                </select>
              </div>

              {/* upload file invoice not required sent as base64 */}
              <div className="grid gap-2">
                <Label htmlFor="invoice">Upload Invoice (Opsional)</Label>
                <p className="text-xs text-red-800 mb-2">
                  Upload file invoice dalam format JPG, JPEG, PNG, atau PDF. Maksimal 300KB.
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    id="invoice"
                    name="invoice"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={async (e) => {
                      const file = e.target.files[0]
                      if (file) {
                        // 300KB = 300 * 1024 = 307200 bytes
                        if (file.size > 307200) {
                          setErrorFile("Ukuran file maksimal 300KB")
                          alert("Ukuran file maksimal 300KB")
                          e.target.value = ""
                          return
                        }

                        setInvoiceFileName(file.name)
                        setErrorFile("")
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          setInvoiceFile(event.target.result)
                        }
                        reader.readAsDataURL(file)
                      } else {
                        setInvoiceFile(null)
                        setInvoiceFileName("")
                      }
                    }}
                  />
                  {invoiceFile && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        setInvoiceFile(null)
                        setInvoiceFileName("")
                        document.getElementById("invoice").value = ""
                      }}
                      title="Hapus Invoice"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {invoiceFileName && (
                  <div className="text-xs text-muted-foreground mt-1">File: {invoiceFileName}</div>
                )}
                {
                  errorFile && (
                    <div className="text-red-500 text-xs mt-1">
                      {errorFile}
                    </div>
                  )
                }
              </div>

              {/* Custom Fields */}
              {customFields.length > 0 && !isEdit && (
                <div className="border-t pt-4 mt-6">
                  <h3 className="text-lg font-medium mb-4">Informasi Tambahan</h3>
                  {customFields.map((field) => (
                    <div key={field.id ?? field.key} className="grid gap-2 mb-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`custom_${field.name}`}>{field.label} {field.required && " *"}</Label>
                      </div>
                      {renderCustomField(field)}
                    </div>
                  ))}
                </div>
              )}
              {
                isEdit && transactionData?.additional_data && transactionData.additional_data.length > 0 && (
                  <div className="border-t pt-4 mt-6">
                    <h3 className="text-lg font-medium mb-4">Informasi Tambahan</h3>
                    {transactionData.additional_data.map((field) => (
                      < div key={field.key} className="grid gap-2 mb-4" >
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`custom_${field.key}`}>{field.label}</Label>
                        </div>
                        {
                          renderCustomField({
                            name: field.key,
                            label: field.label,
                            value: field.value,
                            type: "text",
                            required: false,
                          })}
                      </div>
                    ))}
                  </div>
                )
              }

              {
                error && (
                  <div className="text-red-500 text-xs mt-2">
                    {error}
                  </div>
                )
              }

            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/dashboard/transactions">
                <Button variant="outline">Batal</Button>
              </Link>
              {submiting ? (
                <Button variant="outline" disabled>
                  <Plus className="animate-pulse" />
                  Menyimpan...
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isEdit ? "Simpan Perubahan" : "Simpan Transaksi"}
                </Button>
              )}
            </CardFooter>
          </form>
        </> : <>
          <div className="flex items-center justify-center mb-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </>}

      </Card>
    </div >
  )
}
