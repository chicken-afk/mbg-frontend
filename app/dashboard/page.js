"use client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, FileText, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"
import { format } from "date-fns"
import process from "process"


export default function Dashboard() {
  const router = useRouter()
  const [dashboard, setDashboard] = useState(null)
  const fetchData = async () => {
    const auth = localStorage.getItem("isAuthenticated")
    if (auth !== "true") {
      router.push("/")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await axios.get(`${apiUrl}/api/dashboard`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      setDashboard(response.data)
      console.log("Dashboard data:", response.data)
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("isAuthenticated")
          router.push("/")
        } else {
          console.error("Failed to fetch dashboard data", error.response.data)
        }
      } else {
        console.error("Failed to fetch dashboard data", error.message)
      }
    }
  }

  useEffect(() => {
    fetchData()
  }, [router])

  const formatRupiah = (number) => new Intl.NumberFormat("id-ID").format(number)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan aktivitas dan transaksi keuangan</p>
      </div>

      {/* Responsive cards: stack on mobile, row on desktop */}
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 md:grid-cols-1 lg:grid-cols-4 justify-center">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sisa Saldo</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{dashboard ? `Rp. ${formatRupiah(dashboard.data.saldo)}` : "0"}</div>
            <p className="text-xs text-muted-foreground">-</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{dashboard ? `Rp. ${formatRupiah(dashboard.data.total_income)}` : "0"}</div>
            <p className="text-xs text-muted-foreground">-</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium ">Total Pengeluaran</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{dashboard ? `Rp. ${formatRupiah(dashboard.data.total_expense)}` : "0"}</div>
            <p className="text-xs text-muted-foreground">-</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <p className="text-muted-foreground mb-0">Pengeluaran Berdasarkan Pengguna</p>
      </div>
      {/* Responsive user cards: grid with 1 column on mobile, 2 on sm, 3 on md, 5 on lg */}
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mt-0">
        {
          dashboard &&
          dashboard.data.total_spent_by_user.map((user) => (
            <Card key={user.user_id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2">
                <CardTitle className="text-sm font-medium">{user.name}</CardTitle>
                {/* <Users className="h-4 w-4 text-muted-foreground" /> */}
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-xl font-bold text-red-400">{`Rp. ${formatRupiah(user.total_spent)}`}</div>
                <p className="text-xs text-muted-foreground">-</p>
              </CardContent>
            </Card>
          ))
        }
      </div>

      <div>
        <p className="text-muted-foreground mb-0">Pemasukan Berdasarkan Pengguna</p>
      </div>
      {/* Responsive user cards: grid with 1 column on mobile, 2 on sm, 3 on md, 5 on lg */}
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mt-0">
        {
          dashboard &&
          dashboard.data.total_income_by_user.map((user) => (
            <Card key={user.user_id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2">
                <CardTitle className="text-sm font-medium">{user.name}</CardTitle>
                {/* <Users className="h-4 w-4 text-muted-foreground" /> */}
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-xl font-bold text-green-400">{`Rp. ${formatRupiah(user.total_income)}`}</div>
                <p className="text-xs text-muted-foreground">-</p>
              </CardContent>
            </Card>
          ))
        }
      </div>

      {/* Responsive: stack on mobile, grid on md+ */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-1 md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>5 transaksi terakhir yang tercatat dalam sistem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard && dashboard.data.recent_transactions.map((data) => (
                <div key={data.uuid} className="flex items-center gap-4">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center ${data.type === "pengeluaran" ? "bg-red-100" : "bg-green-100"}`}
                  >
                    <span className={data.type === "pengeluaran" ? "text-red-500" : "text-green-500"}>{data.type === "pengeluaran" ? "-" : "+"}</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {data.description}
                    </p>
                    <p className="text-xs text-muted-foreground">{format(new Date(data.created_at), "HH:mm dd-MM-yyyy")}</p>
                  </div>
                  <div className="font-medium">Rp. {formatRupiah(data.amount)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
