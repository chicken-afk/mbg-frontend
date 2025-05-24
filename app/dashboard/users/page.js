"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import axios from "axios"
import { set } from "date-fns"
import LoadingButton from "@/components/LoadingButton"
import { toast } from "sonner"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    itemsPerPage: 10,
  })
  const [newUser, setNewUser] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "1",
    status: "1",
    client_id: "",
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [clients, setClients] = useState([])
  const [isClientLoading, setIsClientLoading] = useState(true)

  const fetchClients = async () => {
    setIsClientLoading(true) // Set loading state
    setClients([]) // Reset clients state
    const token = localStorage.getItem("token")
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    try {
      const response = await axios.get(`${apiUrl}/api/warehouses?pagination=false`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      const responseData = response.data
      let clientData = []
      clientData = responseData.data.map((client) => ({
        id: client.id,
        name: client.name,
      }))
      setClients(clientData)
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Handle unauthorized error
        localStorage.removeItem("token")
        window.location.href = "/?forceLogout=true"
        return
      }
      console.error("Error fetching clients:", error)
      setError("Gagal mengambil data client. Silakan coba lagi.")
    }
    setIsClientLoading(false) // Reset loading state
  }

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    setUserRole(role)
    console.log("User role:", role)
  }, [localStorage.getItem("userRole")])

  const fetchData = async () => {
    setIsLoading(true) // Set loading state
    setError(null) // Reset error state
    setUsers([]) // Reset users state
    try {
      const token = localStorage.getItem("token")
      const searchFilter = debouncedSearchTerm ? `search=${debouncedSearchTerm}` : ""
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await axios.get(`${apiUrl}/api/users?${searchFilter}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      const bodyData = response.data
      const responseData = bodyData.data
      let userData = []
      console.log("Response data:", responseData)
      userData = responseData.data.map((user) => ({
        id: user.id,
        username: user.name,
        name: user.name,
        email: user.email,
        role: user.role === 1 ? "admin" : (user.role === 3 ? "superadmin" : "staff"),
        lastLogin: user.last_login_at ?? "-",
        status: user.status === 1 ? "active" : "inactive",
        createdAt: user.created_at,
        client: user.client,
      }))
      console.log("User data:", userData)
      setUsers(userData)
      setPagination({
        currentPage: responseData.current_page,
        totalPages: responseData.last_page,
        itemsPerPage: responseData.per_page,
      })
      console.log("Data fetched:", bodyData)
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Handle unauthorized error
        toast.error("Unauthorized. Silakan login kembali.")
        localStorage.removeItem("token")
        window.location.href = "/?forceLogout=true"
        return
      }
      console.error("Error fetching users:", error)
    }
    setIsLoading(false) // Reset loading state
  }

  useEffect(() => {
    // Fetch data from API
    fetchData()
    // For now, we'll use our mock data
  }, [debouncedSearchTerm])

  const handleAddUser = async () => {
    setError(null) // Reset error state
    setIsLoading(true) // Set loading state
    // Validate form
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Semua field wajib diisi")
      setIsLoading(false)
      return
    }

    console.log("New user data:", newUser)

    //axios post request to add new user
    const token = localStorage.getItem("token")
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    try {
      const res = await axios
        .post(
          `${apiUrl}/api/users`,
          {
            name: newUser.name,
            email: newUser.email,
            password: newUser.password,
            role: newUser.role,
            status: newUser.status,
            client_id: newUser.client_id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        )
    } catch (error) {
      console.error("Error adding user:", error)
      // Handle error
      if (error.response && error.response.status === 422) {
        setError(error.response.data.message)
        setIsLoading(false)
        return
      }
      if (error.response && error.response.status === 401) {
        // Handle unauthorized error
        toast.error("Unauthorized. Silakan login kembali.")
        localStorage.removeItem("token")
        window.location.href = "/"
        return
      }
      setError("Gagal menambahkan pengguna. Silakan coba lagi.")
      setIsLoading(false)
      return
    }
    // Reset form and close dialog
    setNewUser({
      username: "",
      name: "",
      email: "",
      password: "",
      role: "1",
      status: "1",
    })
    fetchData() // Fetch updated data
    setError(null)
    setIsLoading(false)
    setIsAddUserOpen(false)
  }

  const handleEditUser = async () => {
    if (!currentUser.name || !currentUser.email) {
      alert("Nama, username, dan email wajib diisi")
      return
    }
    setIsLoading(true) // Set loading state

    // setUsers(updatedUsers)
    // localStorage.setItem("users", JSON.stringify(updatedUsers))
    console.log("Updated user data:", currentUser)
    const token = localStorage.getItem("token")
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    try {
      const res = await axios
        .put(
          `${apiUrl}/api/users/${currentUser.id}`,
          {
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
            status: currentUser.status,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          },
        )
      console.log("User updated:", res.data)
    } catch (error) {
      console.error("Error updating user:", error)
      // Handle error
      if (error.response && error.response.status === 422) {
        setError(error.response.data.message)
        setIsLoading(false)
        return
      }
      setError("Gagal memperbarui pengguna. Silakan coba lagi.")
      setIsLoading(false)
      return
    }
    // Reset form and close dialog
    setCurrentUser(null)
    fetchData() // Fetch updated data
    setError(null)
    setIsLoading(false)
    setIsEditUserOpen(false)
  }

  const handleDeleteUser = async (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      try {
        const res = await axios
          .delete(`${apiUrl}/api/users/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
        console.log("User deleted:", res.data)
        // Fetch updated data
        fetchData()
      } catch (error) {
        console.error("Error deleting user:", error)
        // Handle error
        if (error.response && error.response.status === 422) {
          setError(error.response.data.message)
          setIsLoading(false)
          return
        }
        if (error.response && error.response.status === 401) {
          // Handle unauthorized error'
          toast.error("Unauthorized. Silakan login kembali.")
          localStorage.removeItem("token")
          window.location.href = "/"
          return
        }
        setError("Gagal menghapus pengguna. Silakan coba lagi.")
        setIsLoading(false)
        return
      }
    }
  }

  // const filteredUsers = users.filter(
  //   (user) =>
  //     user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  // )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen User</h1>
          <p className="text-muted-foreground">Kelola pengguna yang memiliki akses ke sistem</p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button onClick={fetchClients}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah User Baru</DialogTitle>
              <DialogDescription>Isi informasi untuk membuat user baru</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    {(userRole === "3" || userRole === 3) && (
                      <SelectItem value="3">Superadmin</SelectItem>
                    )}
                    <SelectItem value="1">Admin</SelectItem>
                    <SelectItem value="2">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newUser.status} onValueChange={(value) => setNewUser({ ...newUser, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {
                userRole === "3" || userRole === 3 ? (
                  <div className="grid gap-2">
                    <Label htmlFor="client_id">Client</Label>
                    <Select {...isClientLoading && "disabled"} className={isClientLoading && "animate-pulse"} value={newUser.client_id} onValueChange={(value) => setNewUser({ ...newUser, client_id: value })}>
                      <SelectTrigger id="client_id">
                        <SelectValue placeholder={isClientLoading ? "Loading.." : "Pilih Clients"} />
                      </SelectTrigger>
                      <SelectContent>
                        {
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                ) : null
              }
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Batal
              </Button>
              {isLoading ? (
                <Button disabled>
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="2" x2="12" y2="6" />
                    <line x1="12" y1="18" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="6" y2="12" />
                    <line x1="18" y1="12" x2="22" y2="12" />
                    <line x1="4.22" y1="4.22" x2="7.76" y2="7.76" />
                    <line x1="16.24" y1="16.24" x2="19.78" y2="19.78" />
                    <line x1="4.22" y1="19.78" x2="7.76" y2="16.24" />
                    <line x1="16.24" y1="7.76" x2="19.78" y2="4.22" />
                  </svg>
                  Menyimpan...
                </Button>
              ) : (<Button onClick={handleAddUser}>Simpan</Button>)}

            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>Semua pengguna yang terdaftar dalam sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari pengguna berdasar nama atau email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Terakhir Masuk</TableHead>
                  <TableHead>Waktu Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.client ? user.client.name : "-"}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.role === "admin" ? "Admin" : user.role === "superadmin" ? "Superadmin" : "Staff"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "default" : "secondary"}>
                          {user.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString("id-ID")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog
                            open={isEditUserOpen && currentUser?.id === user.id}
                            onOpenChange={(open) => {
                              setIsEditUserOpen(open)
                              if (open) setCurrentUser(user)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setCurrentUser(user)
                                  setIsEditUserOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                                <DialogDescription>Edit informasi pengguna</DialogDescription>
                              </DialogHeader>
                              {currentUser && (
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Nama Lengkap</Label>
                                    <Input
                                      id="edit-name"
                                      value={currentUser.name}
                                      onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                      id="edit-email"
                                      type="email"
                                      value={currentUser.email}
                                      onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-role">Role</Label>
                                    <Select
                                      value={currentUser.role}
                                      onValueChange={(value) => setCurrentUser({ ...currentUser, role: value })}
                                    >
                                      <SelectTrigger id="edit-role">
                                        <SelectValue placeholder="Pilih role" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {
                                          (userRole === "3" || userRole === 3) && (
                                            <SelectItem value="3">Superadmin</SelectItem>
                                          )
                                        }
                                        <SelectItem value="1">Admin</SelectItem>
                                        <SelectItem value="2">Staff</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-status">Status</Label>
                                    <Select
                                      value={currentUser.status}
                                      onValueChange={(value) => setCurrentUser({ ...currentUser, status: value })}
                                    >
                                      <SelectTrigger id="edit-status">
                                        <SelectValue placeholder="Pilih status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="1">Active</SelectItem>
                                        <SelectItem value="0">Inactive</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                                  Batal
                                </Button>
                                {isLoading ? (
                                  <Button disabled>
                                    <svg
                                      className="animate-spin h-5 w-5 mr-3 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="2" x2="12" y2="6" />
                                      <line x1="12" y1="18" x2="12" y2="22" />
                                      <line x1="2" y1="12" x2="6" y2="12" />
                                      <line x1="18" y1="12" x2="22" y2="12" />
                                      <line x1="4.22" y1="4.22" x2="7.76" y2="7.76" />
                                      <line x1="16.24" y1="16.24" x2="19.78" y2="19.78" />
                                      <line x1="4.22" y1="19.78" x2="7.76" y2="16.24" />
                                      <line x1="16.24" y1="7.76" x2="19.78" y2="4.22" />
                                    </svg>
                                    Menyimpan...
                                  </Button>
                                ) : (
                                  <Button onClick={handleEditUser}>Simpan</Button>
                                )}
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.username === "admin"} // Prevent deleting the admin user
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className={isLoading ? "animate-pulse text-center py-6" : "text-center py-6"}>
                      {isLoading ? "Loading..." : "Tidak ada data pengguna ditemukan"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    {pagination.currentPage} dari {pagination.totalPages} halaman
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
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
