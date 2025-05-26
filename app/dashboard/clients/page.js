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
import LoadingButton from "@/components/LoadingButton"
import { toast } from "sonner"

export default function ClientsPage() {
    const [clients, setClients] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
    const [isAddClientOpen, setIsAddClientOpen] = useState(false)
    const [isEditClientOpen, setIsEditClientOpen] = useState(false)
    const [currentClient, setCurrentClient] = useState(null)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        itemsPerPage: 10,
    })
    const [newClient, setNewClient] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        status: "1",
        password: "",
    })

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 300)
        return () => {
            clearTimeout(handler)
        }
    }, [searchTerm])

    const fetchData = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const token = localStorage.getItem("token")
            const searchFilter = debouncedSearchTerm ? `search=${debouncedSearchTerm}` : ""
            const apiUrl = process.env.NEXT_PUBLIC_API_URL
            const response = await axios.get(`${apiUrl}/api/warehouses?${searchFilter}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })
            const bodyData = response.data
            const responseData = bodyData.data
            let clientData = []
            clientData = responseData.data.map((client) => ({
                id: client.id,
                name: client.name,
                email: client.email,
                phone: client.phone ?? "-",
                address: client.address ?? "-",
                status: client.status,
                createdAt: client.created_at,
            }))
            console.log("client data", clientData)
            setClients(clientData)
            setPagination({
                currentPage: responseData.current_page,
                totalPages: responseData.last_page,
                itemsPerPage: responseData.per_page,
            })
        } catch (error) {
            if (error.response && error.response.status === 401) {
                toast.error("Unauthorized. Silakan login kembali.")
                localStorage.removeItem("token")
                window.location.href = "/?forceLogout=true"
                return
            }
            setError("Error fetching clients")
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [debouncedSearchTerm])

    const handleAddClient = async () => {
        setError(null)
        setIsLoading(true)
        if (!newClient.name || newClient.name.trim() === "") {
            alert("Nama wajib diisi")
            setIsLoading(false)
            return
        }

        const token = localStorage.getItem("token")
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        try {
            await axios.post(
                `${apiUrl}/api/warehouses`,
                {
                    name: newClient.name,
                    email: newClient.email,
                    phone: newClient.phone,
                    address: newClient.address,
                    status: newClient.status,
                    password: newClient.password
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            )
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setError(error.response.data.message)
                setIsLoading(false)
                return
            }
            if (error.response && error.response.status === 401) {
                toast.error("Unauthorized. Silakan login kembali.")
                localStorage.removeItem("token")
                window.location.href = "/"
                return
            }
            setError("Gagal menambahkan project. Silakan coba lagi.")
            setIsLoading(false)
            return
        }
        setNewClient({
            name: "",
            email: "",
            phone: "",
            address: "",
            status: "1",
        })
        fetchData()
        setError(null)
        setIsLoading(false)
        setIsAddClientOpen(false)
    }

    const handleEditClient = async () => {
        setIsLoading(true)
        if (!currentClient.name) {
            alert("Nama wajib diisi")
            return
        }
        const token = localStorage.getItem("token")
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        try {
            await axios.put(
                `${apiUrl}/api/warehouses/${currentClient.id}`,
                {
                    name: currentClient.name,
                    email: currentClient.email,
                    phone: currentClient.phone,
                    address: currentClient.address,
                    status: currentClient.status,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                }
            )
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setError(error.response.data.message)
                setIsLoading(false)
                return
            }
            setError("Gagal memperbarui client. Silakan coba lagi.")
            setIsLoading(false)
            return
        }
        setCurrentClient(null)
        fetchData()
        setError(null)
        setIsLoading(false)
        setIsEditClientOpen(false)
    }

    const handleDeleteClient = async (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus project ini?")) {
            const token = localStorage.getItem("token")
            const apiUrl = process.env.NEXT_PUBLIC_API_URL
            try {
                await axios.delete(`${apiUrl}/api/warehouses/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                })
                fetchData()
            } catch (error) {
                if (error.response && error.response.status === 422) {
                    setError(error.response.data.message)
                    setIsLoading(false)
                    return
                }
                if (error.response && error.response.status === 401) {
                    toast.error("Unauthorized. Silakan login kembali.")
                    localStorage.removeItem("token")
                    window.location.href = "/"
                    return
                }
                setError("Gagal menghapus client. Silakan coba lagi.")
                setIsLoading(false)
                return
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen project</h1>
                    <p className="text-muted-foreground">Kelola data project di sistem</p>
                </div>
                <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah Project Baru</DialogTitle>
                            <DialogDescription>Isi informasi untuk membuat project baru</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama</Label>
                                <Input
                                    id="name"
                                    value={newClient.name}
                                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telepon</Label>
                                <Input
                                    id="phone"
                                    value={newClient.phone}
                                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Alamat</Label>
                                <Input
                                    id="address"
                                    value={newClient.address}
                                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={newClient.status} onValueChange={(value) => setNewClient({ ...newClient, status: value })}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Active</SelectItem>
                                        <SelectItem value="0">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>
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
                            ) : (<Button onClick={handleAddClient}>Simpan</Button>)}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Project</CardTitle>
                    <CardDescription>Semua project yang terdaftar dalam sistem</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Cari project berdasar nama atau email..."
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
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Telepon</TableHead>
                                    <TableHead>Alamat</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Waktu Dibuat</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {
                                    isLoading ? <>
                                        <TableCell colSpan={7} className="text-center py-6 animate-pulse">
                                            Memuat data...
                                        </TableCell>
                                    </> : (
                                        clients.length > 0 ? (
                                            clients.map((client) => (
                                                <TableRow key={client.id}>
                                                    <TableCell className="font-medium">{client.name}</TableCell>
                                                    <TableCell>{client.phone}</TableCell>
                                                    <TableCell>{client.address}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={client.status === 1 ? "default" : "secondary"}>
                                                            {client.status === 1 ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{new Date(client.createdAt).toLocaleDateString("id-ID")}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Dialog
                                                                open={isEditClientOpen && currentClient?.id === client.id}
                                                                onOpenChange={(open) => {
                                                                    setIsEditClientOpen(open)
                                                                    if (open) setCurrentClient(client)
                                                                    console.log(currentClient)
                                                                }}
                                                            >
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => {
                                                                            setCurrentClient(client)
                                                                            setIsEditClientOpen(true)
                                                                        }}
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                        <span className="sr-only">Edit</span>
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogHeader>
                                                                        <DialogTitle>Edit Client</DialogTitle>
                                                                        <DialogDescription>Edit informasi client</DialogDescription>
                                                                    </DialogHeader>
                                                                    {currentClient && (
                                                                        <div className="grid gap-4 py-4">
                                                                            <div className="grid gap-2">
                                                                                <Label htmlFor="edit-name">Nama</Label>
                                                                                <Input
                                                                                    id="edit-name"
                                                                                    value={currentClient.name}
                                                                                    onChange={(e) => setCurrentClient({ ...currentClient, name: e.target.value })}
                                                                                />
                                                                            </div>
                                                                            <div className="grid gap-2">
                                                                                <Label htmlFor="edit-phone">Telepon</Label>
                                                                                <Input
                                                                                    id="edit-phone"
                                                                                    value={currentClient.phone}
                                                                                    onChange={(e) => setCurrentClient({ ...currentClient, phone: e.target.value })}
                                                                                />
                                                                            </div>
                                                                            <div className="grid gap-2">
                                                                                <Label htmlFor="edit-address">Alamat</Label>
                                                                                <Input
                                                                                    id="edit-address"
                                                                                    value={currentClient.address}
                                                                                    onChange={(e) => setCurrentClient({ ...currentClient, address: e.target.value })}
                                                                                />
                                                                            </div>
                                                                            <div className="grid gap-2">
                                                                                <Label htmlFor="edit-status">Status</Label>
                                                                                <Select
                                                                                    value={currentClient.status?.toString()}
                                                                                    onValueChange={(value) => setCurrentClient({ ...currentClient, status: value })}
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
                                                                        <Button variant="outline" onClick={() => setIsEditClientOpen(false)}>
                                                                            Batal
                                                                        </Button>
                                                                        {isLoading ? (<><LoadingButton /></>) : (
                                                                            <Button onClick={handleEditClient}>Simpan</Button>)}
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteClient(client.id)}
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
                                                <TableCell colSpan={7} className="text-center py-6">
                                                    Tidak ada project yang ditemukan
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )
                                }
                            </TableBody>
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
        </div >
    )
}