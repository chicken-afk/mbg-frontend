"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

  const handleSubmit = async (e) => {
    setLoading(true)
    setError("")
    const backendUrl = "http://103.189.234.173:8000/api/login";
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
        router.push("/dashboard");
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
    }
    setLoading(false)
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
