"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Download, Printer } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock implementation of Chart.js components for simplicity
const Line = ({ data, options }) => (
  <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-md">
    <div className="text-center p-4">
      <div className="text-lg font-medium">Line Chart</div>
      <div className="text-sm text-muted-foreground">Chart visualization would appear here</div>
    </div>
  </div>
)

const Bar = ({ data, options }) => (
  <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-md">
    <div className="text-center p-4">
      <div className="text-lg font-medium">Bar Chart</div>
      <div className="text-sm text-muted-foreground">Chart visualization would appear here</div>
    </div>
  </div>
)

const Pie = ({ data, options }) => (
  <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-md">
    <div className="text-center p-4">
      <div className="text-lg font-medium">Pie Chart</div>
      <div className="text-sm text-muted-foreground">Chart visualization would appear here</div>
    </div>
  </div>
)

export default function ReportsPage() {
  const [transactions, setTransactions] = useState([])
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    to: new Date(),
  })
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [chartType, setChartType] = useState("line")
  const [periodType, setPeriodType] = useState("monthly")
  const [reportData, setReportData] = useState(null)
  const chartRef = useRef(null)
  const tableRef = useRef(null)

  // Mock transactions data
  const mockTransactions = [
    {
      id: 1,
      date: "2023-05-10",
      description: "Pembayaran Supplier",
      amount: -1250000,
      category: "Pengeluaran",
      status: "Selesai",
      paymentMethod: "Transfer Bank",
    },
    {
      id: 2,
      date: "2023-05-12",
      description: "Pendapatan Penjualan",
      amount: 2500000,
      category: "Pemasukan",
      status: "Selesai",
      paymentMethod: "Tunai",
    },
    {
      id: 3,
      date: "2023-05-15",
      description: "Pembayaran Gaji",
      amount: -3500000,
      category: "Pengeluaran",
      status: "Selesai",
      paymentMethod: "Transfer Bank",
    },
    {
      id: 4,
      date: "2023-05-18",
      description: "Pendapatan Penjualan",
      amount: 1800000,
      category: "Pemasukan",
      status: "Selesai",
      paymentMethod: "Transfer Bank",
    },
    {
      id: 5,
      date: "2023-05-20",
      description: "Pembayaran Listrik",
      amount: -750000,
      category: "Pengeluaran",
      status: "Selesai",
      paymentMethod: "Auto Debit",
    },
  ]

  useEffect(() => {
    // Load transactions from localStorage or use mock data
    const storedTransactions = localStorage.getItem("transactions")
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions))
    } else {
      setTransactions(mockTransactions)
    }
  }, [])

  useEffect(() => {
    if (transactions.length > 0) {
      generateReportData()
    }
  }, [transactions, dateRange, categoryFilter, periodType])

  const generateReportData = () => {
    // Filter transactions by date range and category
    const filteredTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      const isInDateRange = transactionDate >= dateRange.from && transactionDate <= dateRange.to
      const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter
      return isInDateRange && matchesCategory
    })

    // Calculate totals
    const totalIncome = filteredTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = filteredTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const netIncome = totalIncome - totalExpense

    // Prepare mock data for charts
    const pieData = {
      labels: ["Pemasukan", "Pengeluaran"],
      datasets: [
        {
          data: [totalIncome, totalExpense],
          backgroundColor: ["rgba(34, 197, 94, 0.6)", "rgba(239, 68, 68, 0.6)"],
          borderColor: ["rgb(34, 197, 94)", "rgb(239, 68, 68)"],
          borderWidth: 1,
        },
      ],
    }

    // Simplified mock data for line/bar charts
    const lineBarData = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May"],
      datasets: [
        {
          label: "Pemasukan",
          data: [1200000, 1900000, 1700000, 2100000, 2500000],
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.5)",
        },
        {
          label: "Pengeluaran",
          data: [900000, 1200000, 1500000, 1300000, 1800000],
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.5)",
        },
      ],
    }

    setReportData({
      filteredTransactions,
      totalIncome,
      totalExpense,
      netIncome,
      pieData,
      lineBarData,
    })
  }

  const exportToCSV = () => {
    alert("Exporting to CSV...")
    // Implementation would go here in a real app
  }

  const printReport = () => {
    alert("Opening print view...")
    // Implementation would go here in a real app
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Laporan Keuangan</h1>
        <p className="text-muted-foreground">Analisis dan ekspor data keuangan</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
          <CardDescription>Sesuaikan parameter untuk melihat laporan yang diinginkan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="grid gap-2">
              <Label>Rentang Tanggal</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, "dd MMM yyyy") : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <span className="self-center">-</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.to && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, "dd MMM yyyy") : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="categoryFilter">Kategori</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="categoryFilter">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="Pemasukan">Pemasukan</SelectItem>
                  <SelectItem value="Pengeluaran">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="periodType">Periode</Label>
              <Select value={periodType} onValueChange={setPeriodType}>
                <SelectTrigger id="periodType">
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="weekly">Mingguan</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="yearly">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="chartType">Jenis Grafik</Label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger id="chartType">
                  <SelectValue placeholder="Pilih jenis grafik" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
                    reportData.totalIncome,
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Periode {format(dateRange.from, "dd MMM yyyy")} - {format(dateRange.to, "dd MMM yyyy")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
                    reportData.totalExpense,
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Periode {format(dateRange.from, "dd MMM yyyy")} - {format(dateRange.to, "dd MMM yyyy")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Saldo Bersih</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${reportData.netIncome >= 0 ? "text-blue-500" : "text-red-500"}`}>
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(reportData.netIncome)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Periode {format(dateRange.from, "dd MMM yyyy")} - {format(dateRange.to, "dd MMM yyyy")}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Grafik Keuangan</CardTitle>
              <CardDescription>Visualisasi data keuangan berdasarkan filter yang dipilih</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]" ref={chartRef}>
                {chartType === "line" && <Line data={reportData.lineBarData} />}
                {chartType === "bar" && <Bar data={reportData.lineBarData} />}
                {chartType === "pie" && <Pie data={reportData.pieData} />}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Detail Transaksi</CardTitle>
                <CardDescription>Daftar transaksi berdasarkan filter yang dipilih</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={printReport}>
                  <Printer className="mr-2 h-4 w-4" />
                  Cetak
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border" ref={tableRef}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.filteredTransactions.length > 0 ? (
                      reportData.filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{format(new Date(transaction.date), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Badge variant={transaction.category === "Pemasukan" ? "outline" : "secondary"}>
                              {transaction.category}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${
                              transaction.amount < 0 ? "text-red-500" : "text-green-500"
                            }`}
                          >
                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
                              transaction.amount,
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{transaction.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          Tidak ada transaksi yang ditemukan
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
