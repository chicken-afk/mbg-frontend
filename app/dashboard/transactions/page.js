"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Download, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { useSearchParams, useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@radix-ui/react-toast"
import { Dialog } from "@radix-ui/react-dialog"
import ConfirmDialog from "@/components/ui/confirmdialog"

export default function TransactionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [transactions, setTransactions] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [filterDate, setFilterDate] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    itemsPerPage: 10,
  })
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDeleteId, setSelectedDeleteId] = useState(null)
  console.log("Delete dialog open:", deleteDialogOpen)

  const [showModalExport, setShowModalExport] = useState(false)
  const [exportFilter, setExportFilter] = useState({
    startDate: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    type: "all",
  })

  const [isExporting, setIsExporting] = useState(false)

  const from = searchParams.get('from') || null

  const userRole = localStorage.getItem("userRole")

  const fetchData = async () => {
    setLoading(true)
    try {

      let filterUrl = filterCategory === "all" ? "" : `type=${filterCategory}`
      if (debouncedSearchTerm) {
        filterUrl += filterUrl ? `&search=${debouncedSearchTerm}` : `search=${debouncedSearchTerm}`
      }

      let filterDateUrl = filterDate ? `transaction_at=${filterDate}` : null
      if (filterDate) {
        filterUrl += filterUrl ? `&${filterDateUrl}` : filterDateUrl
      }

      let pageUrl = `page=${pagination.currentPage}`
      if (pagination.currentPage) {
        filterUrl += filterUrl ? `&${pageUrl}` : pageUrl
      }
      if (pagination.itemsPerPage) {
        filterUrl += filterUrl ? `&per_page=${pagination.itemsPerPage}` : `per_page=${pagination.itemsPerPage}`
      }

      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await axios.get(`${apiUrl}/api/transactions?${filterUrl}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      console.log("Transactions data:", response.data.data)
      setTransactions(response.data.data.data)
      setPagination({
        currentPage: response.data.data.current_page,
        totalPages: response.data.data.last_page,
        itemsPerPage: response.data.data.per_page,
      })
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch transactions", error)
      setLoading(false)
      if (error.response) {
        if (error.response.status === 401) {
          confirm("Session expired, please login again")
        }
      } else {
        console.error("Request failed:", error.message)
      }
    }
  }


  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(handler)
  }, [searchTerm])

  // Fetching logic (uses debouncedSearchTerm)
  useEffect(() => {
    // setLoading(true)

    fetchData()
    // setLoading(false)
  }, [filterCategory, debouncedSearchTerm, filterDate, pagination.currentPage, from])


  const handleDelete = async () => {
    // setLoading(true)
    const id = selectedDeleteId
    const token = localStorage.getItem("token")
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    try {
      const response = await axios.delete(`${apiUrl}/api/transactions/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      console.log("Delete response:", response.data)
      if (response.status === 200) {
        console.log("Transaction deleted successfully")
        setSelectedDeleteId(null)
        setDeleteDialogOpen(false)
        fetchData()
      } else {
        // toast.error("Gagal menghapus transaksi")
      }
    }
    catch (error) {
      console.error("Failed to delete transaction", error)
      setDeleteDialogOpen(false)
      if (error.response) {
        if (error.response.status === 401) {
          confirm("Session expired, please login again")
          window.location.href = "/"
        }
      } else {
        console.error("Request failed:", error.message)
        // toast.error("Gagal menghapus transaksi")
      }
    }
    setDeleteDialogOpen(false)
    setLoading(false)
    fetchData()
  }

  const exportPdf = async () => {
    setIsExporting(true)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = localStorage.getItem("token");
    const startDate = exportFilter.startDate || "";
    const endDate = exportFilter.endDate || "";
    const type = exportFilter.type || "";
    const filterUrl = `start_date=${startDate}&end_date=${endDate}&type=${type}`;

    try {
      const response = await axios.get(`${apiUrl}/api/transactions-export-pdf?${filterUrl}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // 👈 very important
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      //open in new tab
      window.open(url, "_blank");
      // Clean up
      // window.URL.revokeObjectURL(url);
      window.URL.revokeObjectURL(url);
      setIsExporting(false);
    } catch (error) {
      console.error("Failed to export PDF:", error);
    }
    setIsExporting(false)
    // setShowModalExport(false)
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaksi</h1>
          <p className="text-muted-foreground">Kelola semua transaksi keuangan</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/transactions/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Transaksi
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
          <CardDescription>Semua transaksi keuangan yang tercatat dalam sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-1 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari transaksi..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-[200px]">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filterDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDate ? filterDate : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filterDate}
                    onSelect={(date) => setFilterDate(format(date, "yyyy-MM-dd"))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="pemasukan">Pemasukan</SelectItem>
                <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowModalExport(true)}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            {/* Modal Export */}
            {showModalExport && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h2 className="text-lg font-bold mb-4">Ekspor Data Transaksi</h2>
                  {/* Add filter start date and end date */}
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Start Date</label>
                    <Input
                      type="date"
                      className="w-full"
                      onChange={(e) => setExportFilter({ ...exportFilter, startDate: format(e.target.value, 'yyyy-MM-dd') })}
                      value={exportFilter.startDate}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">End Date</label>
                    <Input
                      type="date"
                      className="w-full"
                      onChange={(e) => setExportFilter({ ...exportFilter, endDate: format(e.target.value, 'yyyy-MM-dd') })}
                      value={exportFilter.endDate}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Kategori</label>
                    <Select
                      value={exportFilter.type}
                      onValueChange={(value) => setExportFilter({ ...exportFilter, type: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        <SelectItem value="pemasukan">Pemasukan</SelectItem>
                        <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2">

                    <Button variant="outline" onClick={() => setShowModalExport(false)} className="mt-4">
                      Tutup
                    </Button>
                    {
                      isExporting ? (
                        <Button variant="outline" className="mt-4 ml-2 text-white bg-primary animate-pulse" disabled>
                          Exporting...
                        </Button>
                      ) : (
                        <Button variant="outline" className="mt-4 ml-2 text-white bg-primary" onClick={exportPdf}>
                          Export PDF
                        </Button>
                      )
                    }
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal Input</TableHead>
                  <TableHead>Tanggal Transaksi</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              {
                loading ? (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin h-5 w-5 text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" />
                            <path className="opacity-75" d="M4 12a8 8 0 1 1 16 0A8 8 0 0 1 4 12z" />
                          </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Loading data...</p>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                ) : (
                  <TableBody>
                    {transactions && transactions.length > 0 ? (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.uuid}>
                          <TableCell>{new Date(transaction.created_at).toLocaleDateString("id-ID")}</TableCell>
                          <TableCell>{transaction.transaction_at ? new Date(transaction.transaction_at).toLocaleDateString("id-ID") : "-"}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Badge variant={transaction.type === "pemasukan" ? "outline" : "secondary"}>
                              {transaction.type === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${transaction.amount < 0 ? "text-red-500" : "text-green-500"}`}
                          >
                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
                              transaction.amount,
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{transaction.user.name}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/dashboard/transactions/view/${transaction.uuid}`}>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </Button>
                              </Link>
                              {
                                (userRole === "1" || userRole === 1) && (
                                  <>
                                    <Button variant="ghost" size="icon" onClick={() => {
                                      setSelectedDeleteId(transaction.id);
                                      setDeleteDialogOpen(true);
                                    }}>
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Delete</span>
                                    </Button>
                                    <ConfirmDialog
                                      open={deleteDialogOpen}
                                      onOpenChange={setDeleteDialogOpen}
                                      title="Delete Item?"
                                      description="Are you sure you want to delete this item? This action is irreversible."
                                      onConfirm={() => handleDelete()}
                                      onCancel={() => setDeleteDialogOpen(false)}
                                      confirmText="Delete"
                                      cancelText="Cancel"
                                      confirmButtonClassName="bg-red-500 text-white hover:bg-red-600"
                                      cancelButtonClassName="bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    />
                                  </>
                                )
                              }
                              {/* <Link href={`/dashboard/transactions/edit/${transaction.id}`}>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </Link>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(transaction.id)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button> */}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          Tidak ada transaksi yang ditemukan
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                )
              }

              <TableFooter>
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    {pagination.currentPage} dari {pagination.totalPages} halaman
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    <Button
                      className="button-sm mr-2"
                      variant="outline"
                      size="sm"
                      disabled={pagination.currentPage === 1}
                      onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.currentPage === pagination.totalPages}
                      onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                    >
                      Selanjutnya
                    </Button>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
