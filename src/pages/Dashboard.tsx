import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Package,
  Settings,
  Mail,
  Phone,
  MapPin,
  LogOut,
  ShoppingBag,
  Edit3,
} from "lucide-react";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "V";

  return (
    <div className="min-h-screen bg-background web-app-container">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              My Account
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage your profile and preferences
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>

        {/* Profile Card (top) */}
        <Card className="mb-6 border-border/50 card-elevated">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <ProfileAvatar size="lg" editable />
              <div className="text-center sm:text-left flex-1 min-w-0">
                <h2 className="text-lg font-semibold">
                  {user?.name || "Velnox User"}
                </h2>
                <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                  <Mail className="h-3.5 w-3.5" />
                  {user?.email || "No email"}
                </p>
                <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                  <Badge variant="secondary" className="text-xs">
                    Member
                  </Badge>
                  {user?.isAnonymous && (
                    <Badge variant="outline" className="text-xs">
                      Guest Account
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-9 mb-6">
            <TabsTrigger value="profile" className="text-xs gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs gap-1.5">
              <Package className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs gap-1.5">
              <Settings className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-border/50 card-elevated">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Personal Information</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    <Edit3 className="h-3 w-3" />
                    {isEditingProfile ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      defaultValue={user?.name || ""}
                      disabled={!isEditingProfile}
                      placeholder="Your name"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs">
                      Email
                    </Label>
                    <Input
                      id="email"
                      defaultValue={user?.email || ""}
                      disabled
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      disabled={!isEditingProfile}
                      placeholder="Phone number"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Member Since</Label>
                    <Input
                      disabled
                      value="January 2026"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {isEditingProfile && (
                  <>
                    <Separator />
                    <div className="space-y-1.5">
                      <Label htmlFor="street" className="text-xs">
                        Address
                      </Label>
                      <Input
                        id="street"
                        disabled={!isEditingProfile}
                        placeholder="Street address"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="city" className="text-xs">
                          City
                        </Label>
                        <Input
                          id="city"
                          disabled={!isEditingProfile}
                          placeholder="City"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="state" className="text-xs">
                          State
                        </Label>
                        <Input
                          id="state"
                          disabled={!isEditingProfile}
                          placeholder="State"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="zip" className="text-xs">
                          ZIP Code
                        </Label>
                        <Input
                          id="zip"
                          disabled={!isEditingProfile}
                          placeholder="ZIP"
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button size="sm" className="h-8 text-xs">
                        Save Changes
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="border-border/50 card-elevated">
              <CardContent className="p-8 text-center">
                <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <h3 className="text-sm font-semibold">No orders yet</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  When you place an order, it will appear here. Start shopping
                  to see your order history.
                </p>
                <Button
                  size="sm"
                  className="mt-4 h-8 text-xs"
                  onClick={() => navigate("/shop")}
                >
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="border-border/50 card-elevated">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Receive updates about orders and promotions
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    Manage
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Account Security</p>
                    <p className="text-xs text-muted-foreground">
                      Manage your password and security settings
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    Manage
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      Delete Account
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Spacer for mobile bottom nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
