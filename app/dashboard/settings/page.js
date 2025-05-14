"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    companyName: "Acme Inc",
    companyAddress: "Jl. Sudirman No. 123, Jakarta",
    companyPhone: "021-1234567",
    companyEmail: "info@acme.com",
    companyLogo: "",
    currency: "IDR",
    dateFormat: "DD/MM/YYYY",
    enableNotifications: true,
    enableDarkMode: false,
    backupFrequency: "daily",
    backupLocation: "local",
  })

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    // Load settings from localStorage
    const storedSettings = localStorage.getItem("appSettings")
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings))
    }
  }, [])

  const handleSettingsChange = (key, value) => {
    const updatedSettings = { ...settings, [key]: value }
    setSettings(updatedSettings)
  }

  const saveSettings = () => {
    localStorage.setItem("appSettings", JSON.stringify(settings))
    toast({
      title: "Pengaturan disimpan",
      description: "Perubahan pengaturan telah berhasil disimpan.",
    })
  }

  const handlePasswordChange = (e) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Semua field password harus diisi",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Password baru dan konfirmasi password tidak cocok",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would call an API to change the password
    // For this demo, we'll just show a success message
    toast({
      title: "Password diubah",
      description: "Password Anda telah berhasil diubah.",
    })

    // Reset form
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola pengaturan aplikasi dan akun Anda</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="general">Umum</TabsTrigger>
          <TabsTrigger value="account">Akun</TabsTrigger>
          <TabsTrigger value="system">Sistem</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Umum</CardTitle>
              <CardDescription>Kelola informasi perusahaan dan preferensi tampilan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="companyName">Nama Perusahaan</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => handleSettingsChange("companyName", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="companyAddress">Alamat</Label>
                <Textarea
                  id="companyAddress"
                  value={settings.companyAddress}
                  onChange={(e) => handleSettingsChange("companyAddress", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="companyPhone">Telepon</Label>
                  <Input
                    id="companyPhone"
                    value={settings.companyPhone}
                    onChange={(e) => handleSettingsChange("companyPhone", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) => handleSettingsChange("companyEmail", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="currency">Mata Uang</Label>
                  <Input
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => handleSettingsChange("currency", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dateFormat">Format Tanggal</Label>
                  <Input
                    id="dateFormat"
                    value={settings.dateFormat}
                    onChange={(e) => handleSettingsChange("dateFormat", e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableDarkMode"
                  checked={settings.enableDarkMode}
                  onCheckedChange={(checked) => handleSettingsChange("enableDarkMode", checked)}
                />
                <Label htmlFor="enableDarkMode">Aktifkan Mode Gelap</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>Simpan Perubahan</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Akun</CardTitle>
              <CardDescription>Kelola informasi akun dan keamanan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handlePasswordChange}>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Ubah Password</h3>
                  <div className="grid gap-2">
                    <Label htmlFor="currentPassword">Password Saat Ini</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="newPassword">Password Baru</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit">Ubah Password</Button>
                </div>
              </form>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Notifikasi</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableNotifications"
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => handleSettingsChange("enableNotifications", checked)}
                  />
                  <Label htmlFor="enableNotifications">Aktifkan Notifikasi</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Sistem</CardTitle>
              <CardDescription>Kelola pengaturan sistem dan backup data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="backupFrequency">Frekuensi Backup</Label>
                <Input
                  id="backupFrequency"
                  value={settings.backupFrequency}
                  onChange={(e) => handleSettingsChange("backupFrequency", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="backupLocation">Lokasi Backup</Label>
                <Input
                  id="backupLocation"
                  value={settings.backupLocation}
                  onChange={(e) => handleSettingsChange("backupLocation", e.target.value)}
                />
              </div>
              <div className="pt-4">
                <Button variant="outline">Backup Data Sekarang</Button>
              </div>
              <div className="pt-4 border-t mt-4">
                <h3 className="text-lg font-medium mb-4">Reset Aplikasi</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tindakan ini akan menghapus semua data dan mengatur ulang aplikasi ke pengaturan awal. Tindakan ini
                  tidak dapat dibatalkan.
                </p>
                <Button variant="destructive">Reset Aplikasi</Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>Simpan Perubahan</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
