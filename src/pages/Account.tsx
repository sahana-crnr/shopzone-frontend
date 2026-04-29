import React from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { Button } from "../components/ui/button";
import { FaUserCircle } from "react-icons/fa";
import { toIconComponent } from "../utils/icons";

const UserCircleIcon = toIconComponent(FaUserCircle);

const Account: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const logoutUser = useAuthStore((state) => state.logoutUser);

  const handleSignOut = () => {
    logoutUser();
    navigate("/", { replace: true });
  };

  return (
    <div className="bg-background text-foreground min-h-screen flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <UserCircleIcon className="text-5xl text-purple-600" />
          <h1 className="text-3xl font-bold text-foreground">My Account</h1>
        </div>

        {currentUser ? (
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-muted-foreground">
                  Email Address
                </label>
                <p className="text-lg font-medium">{currentUser.email}</p>
              </div>
            </div>

            <Button variant="destructive" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="text-center p-10 bg-card rounded-lg shadow-sm border border-border">
            <p className="text-lg text-muted-foreground mb-4">
              You are not logged in.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
