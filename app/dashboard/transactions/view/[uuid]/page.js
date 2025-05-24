"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Trash2, AlertCircle, Printer, Download, Edit2 } from "lucide-react"
import { format } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import axios from 'axios';


export default function viewTransaction() {
    const params = useParams();
    const uuid = params.uuid;
    const [user, setUser] = useState(null);
    useEffect(() => {
        const userData = localStorage.getItem("user");
        const parsedUser = userData ? JSON.parse(userData) : null;
        if (parsedUser) {
            setUser(parsedUser);
        }
    }, []);

    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const [transaction, setTransaction] = useState(null)

    const fetchTransaction = async (uuid) => {
        setLoading(true)
        setError("")
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const backendUrl = `${apiUrl}/api/transactions/${uuid}`;
        //get token from local storage
        const token = localStorage.getItem("token");
        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        };
        try {
            const response = await axios.get(backendUrl, config);
            console.log("Transaction data:", response.data);
            setTransaction(response.data.data);
            setLoading(false)
            // if (resData.status === "success") {
            //     router.push(`/dashboard/transactions/${uuid}`)
            // } else {
            //     setError("Internal Server Error");
            // }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 422) {
                    setError("UUID tidak valid");
                } else if (error.response.status == 401) {
                    setError("Unauthorized");
                    localStorage.removeItem("token");
                    localStorage.removeItem("isAuthenticated");
                    router.push("/");
                } else {
                    setError("UUID tidak valid");
                    console.error("API error:", error.response.status, error.response.data);
                }
            } else {
                console.error("Request failed:", error.message);
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchTransaction(uuid);
    }, []);

    // return (
    //     <div>

    //     </div>
    // )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Link href="/dashboard/transactions">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Detail Transaksi</h1>
                </div>
            </div>
            {
                !loading && (
                    <>
                        <Card className="border-primary/20">
                            <CardHeader className="bg-primary/5 rounded-t-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-2xl">{transaction.description}</CardTitle>
                                        <CardDescription>
                                            ID Transaksi: {transaction.uuid} • Dibuat pada {format(new Date(transaction.created_at), "dd MMMM yyyy")}
                                        </CardDescription>
                                    </div>
                                    <Badge
                                        variant={transaction.type === "pemasukan" ? "outline" : "secondary"}
                                        className={`text-base px-3 py-1 ${transaction.type === "pemasukan"
                                            ? "bg-green-500/20 text-green-500"
                                            : "bg-red-500/20 text-red-500"
                                            }`}
                                    >
                                        {transaction.type === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Informasi Utama</h3>
                                        <dl className="space-y-4">
                                            <div className="flex justify-between border-b pb-2">
                                                <dt className="font-medium text-muted-foreground">Jumlah</dt>
                                                <dd className={`font-bold ${transaction.amount < 0 ? "text-red-500" : "text-green-500"}`}>
                                                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(transaction.amount)}
                                                </dd>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <dt className="font-medium text-muted-foreground">Tanggal Transaksi</dt>
                                                <dd>{transaction.transaction_at === null ? "-" : format(new Date(transaction.transaction_at), "dd MMMM yyyy")}</dd>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <dt className="font-medium text-muted-foreground">Status</dt>
                                                <dd>
                                                    <Badge variant="outline">{transaction.status}</Badge>
                                                </dd>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <dt className="font-medium text-muted-foreground">Metode Pembayaran</dt>
                                                <dd>{transaction.payment_method}</dd>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <dt className="font-medium text-muted-foreground">Dibuat Oleh</dt>
                                                <dd>{transaction.user.name}</dd>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <dt className="font-medium text-muted-foreground">Deskripsi</dt>
                                                <dd>{transaction.description}</dd>
                                            </div>
                                            {/* Show file uploaded from transaction.invoice_file, it can be pdf image etc but in base64 format */}
                                            {transaction.invoice_file && (
                                                <div className="flex justify-between border-b pb-2">
                                                    <dt className="font-medium text-muted-foreground">File Invoice</dt>
                                                    <dd>
                                                        {/* Detect file type from base64 string */}
                                                        {(() => {
                                                            // Example: data:application/pdf;base64,JVBERi0xLjQKJ...
                                                            const base64 = transaction.invoice_file;
                                                            const match = base64.match(/^data:(.*?);base64,/);
                                                            const mimeType = match ? match[1] : "";

                                                            if (mimeType.startsWith("image/")) {
                                                                // Show image preview
                                                                return (
                                                                    <a href={base64} target="_blank" rel="noopener noreferrer">
                                                                        <img
                                                                            src={base64}
                                                                            alt="Invoice"
                                                                            className="max-h-32 rounded shadow border hover:scale-105 transition"
                                                                            style={{ display: "inline-block" }}
                                                                        />
                                                                    </a>
                                                                );
                                                            } else if (mimeType === "application/pdf") {
                                                                // Show PDF link
                                                                return (
                                                                    <a href={base64} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                                        Lihat PDF
                                                                    </a>
                                                                );
                                                            } else {
                                                                // Other file types: show download link
                                                                return (
                                                                    <a
                                                                        href={base64}
                                                                        // download="invoice_file"
                                                                        className="text-blue-500 hover:underline"
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        Liat File
                                                                    </a>
                                                                );
                                                            }
                                                        })()}
                                                    </dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Informasi Tambahan</h3>
                                        <div className="space-y-4">
                                            {transaction.notes && (
                                                <div className="border-b pb-2">
                                                    <dt className="font-medium text-muted-foreground mb-1">Deskripsi</dt>
                                                    <dd className="bg-muted/30 p-3 rounded-md">{transaction.description}</dd>
                                                </div>
                                            )}

                                            {transaction.additional_data && transaction.additional_data.length > 0 && (
                                                <div>
                                                    <Separator className="my-4" />
                                                    <dl className="space-y-3">
                                                        {transaction.additional_data.map((item, index) => (
                                                            <div key={index} className="flex justify-between border-b pb-2">
                                                                <dt className="font-medium text-muted-foreground">{item.label}</dt>
                                                                <dd>{item.value}</dd>
                                                            </div>
                                                        ))}
                                                    </dl>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-primary/5 rounded-b-lg flex justify-between pt-1">
                                <div className="text-sm text-muted-foreground">
                                    Terakhir diperbarui:{" "}
                                    {transaction.updated_at
                                        ? format(new Date(transaction.updated_at), "dd MMMM yyyy, HH:mm")
                                        : format(new Date(), "dd MMMM yyyy, HH:mm")}
                                </div>
                                <div className="flex items-center space-x-2">
                                    {
                                        transaction.user_id === user.id && (
                                            <Button variant="outline" className="flex items-center gap-2 bg-yellow-400" onClick={() => router.push(`/dashboard/transactions/add?transaction_uuid=${transaction.uuid}&isEdit=true`)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                        )
                                    }
                                    <Link href="/dashboard/transactions">
                                        <Button variant="outline">Kembali ke Daftar</Button>
                                    </Link>
                                </div>
                            </CardFooter>
                        </Card>

                        {/* <Card className="border-primary/20">
                            <CardHeader>
                                <CardTitle>Riwayat Aktivitas</CardTitle>
                                <CardDescription>Riwayat perubahan pada transaksi ini</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-full bg-primary/20 p-2">
                                            <Edit className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">Transaksi Dibuat</p>
                                            <p className="text-xs text-muted-foreground">
                                                {transaction.created_at
                                                    ? format(new Date(transaction.created_at), "dd MMMM yyyy, HH:mm")
                                                    : format(new Date(transaction.transaction_at), "dd MMMM yyyy, HH:mm")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card> */}
                    </>
                )
            }

        </div>
    )
}
