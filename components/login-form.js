"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import axios from 'axios';

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if forceLogout is present in the URL
  useEffect(() => {
    const forceLogoutParam = searchParams.get("forceLogout");
    if (forceLogoutParam === "true") {
      setError("Sesi Habis. Anda telah keluar dari sistem. Silakan login kembali.");
      localStorage.removeItem("token");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userRole");
      localStorage.removeItem("activeProjet");
    }
  }, [])

  const handleSubmit = async (e) => {
    setLoading(true)
    setError("")
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const backendUrl = `${apiUrl}/api/login`;
    const data = {
      email: username,
      password: password,
    };

    try {
      const response = await axios.post(backendUrl, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Login success:", response.data);
      var resData = response.data;
      if (resData.status === "success") {
        var token = resData.data.token;
        localStorage.setItem("token", token);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", JSON.stringify(resData.data.user));
        localStorage.setItem("users", JSON.stringify(resData.data.user));
        localStorage.setItem("userRole", resData.data.user.role);
        localStorage.setItem("userName", resData.data.user.name);
        localStorage.setItem("userEmail", resData.data.user.email);
        const redirectUrl = resData.data.user.role === 3 ? "/dashboard/clients" : "/dashboard";
        router.push(redirectUrl);
      } else {
        setError("Internal Server Error");
      }

    } catch (error) {
      if (error.response) {
        if (error.response.status === 422) {
          setError("Email atau password tidak valid");
        } else if (error.response.status === 401) {
          setError("Email atau password tidak valid");
          localStorage.removeItem("token");
          localStorage.removeItem("isAuthenticated");
          router.push("/?forceLogout=true");
        } else {
          setError("Email atau password tidak valid");
          console.error("API error:", error.response.status, error.response.data);
        }
      } else {
        console.error("Request failed:", error.message);
      }
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Login Admin</CardTitle>
        <CardDescription className="text-center">
          Masukkan username dan password untuk mengakses panel admin
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Email</Label>
              <Input
                id="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="button" className="w-full" disabled={loading} onClick={handleSubmit}>
              {loading ? "Loading..." : "Login"}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        {/* <p className="text-sm text-muted-foreground">Default: username: admin, password: admin</p> */}
      </CardFooter>
    </Card>
  )
}
