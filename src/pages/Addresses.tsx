import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import useAuthStore from "../store/useAuthStore";
import {
  AddressPayload,
  AddressType,
  createCustomerAddress,
  deleteCustomerAddress,
  fetchCustomerAddresses,
  setDefaultCustomerAddress,
  updateCustomerAddress,
} from "../api/addresses";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaPlus,
  FaHome,
  FaBriefcase,
  FaBuilding,
  FaStar,
  FaTrash,
  FaEdit,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import { toIconComponent } from "../utils/icons";

const ArrowLeftIcon = toIconComponent(FaArrowLeft);
const MapPinIcon = toIconComponent(FaMapMarkerAlt);
const PlusIcon = toIconComponent(FaPlus);
const HomeIcon = toIconComponent(FaHome);
const WorkIcon = toIconComponent(FaBriefcase);
const BuildingIcon = toIconComponent(FaBuilding);
const StarIcon = toIconComponent(FaStar);
const TrashIcon = toIconComponent(FaTrash);
const EditIcon = toIconComponent(FaEdit);
const TimesIcon = toIconComponent(FaTimes);
const CheckIcon = toIconComponent(FaCheck);

const initialFormState: AddressPayload = {
  full_name: "",
  phone_number: "",
  street_address: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  address_type: "HOME",
  is_default: false,
};

const Addresses: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUser = useAuthStore((state) => state.currentUser);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AddressPayload>(initialFormState);

  const {
    data: addresses = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["customer-addresses"],
    queryFn: () => {
      if (!accessToken) throw new Error("Not authenticated");
      return fetchCustomerAddresses(accessToken);
    },
    enabled: Boolean(accessToken),
  });

  const createMutation = useMutation({
    mutationFn: (payload: AddressPayload) => {
      if (!accessToken) throw new Error("Not authenticated");
      return createCustomerAddress(payload, accessToken);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customer-addresses"] });
      toast.success("New address saved successfully!");
      handleCloseModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save address.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<AddressPayload> }) => {
      if (!accessToken) throw new Error("Not authenticated");
      return updateCustomerAddress(id, payload, accessToken);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customer-addresses"] });
      toast.success("Address updated successfully!");
      handleCloseModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update address.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!accessToken) throw new Error("Not authenticated");
      return deleteCustomerAddress(id, accessToken);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customer-addresses"] });
      toast.success("Address deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete address.");
    },
  });

  const defaultMutation = useMutation({
    mutationFn: (id: number) => {
      if (!accessToken) throw new Error("Not authenticated");
      return setDefaultCustomerAddress(id, accessToken);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customer-addresses"] });
      toast.success("Default address updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update default address.");
    },
  });

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      full_name: currentUser?.name || "",
      phone_number: currentUser?.phone || "",
      street_address: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      address_type: "HOME",
      is_default: addresses.length === 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr: typeof addresses[0]) => {
    setEditingId(addr.id);
    setFormData({
      full_name: addr.full_name,
      phone_number: addr.phone_number,
      street_address: addr.street_address,
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country || "India",
      address_type: addr.address_type,
      is_default: addr.is_default,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name.trim()) return toast.error("Full name is required.");
    if (!formData.phone_number.trim()) return toast.error("Phone number is required.");
    if (!formData.street_address.trim()) return toast.error("Street address is required.");
    if (!formData.city.trim()) return toast.error("City is required.");
    if (!formData.state.trim()) return toast.error("State is required.");
    if (!formData.postal_code.trim()) return toast.error("PIN code / Postal code is required.");

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const renderBadgeIcon = (type: AddressType) => {
    switch (type) {
      case "HOME":
        return <HomeIcon className="text-sm" />;
      case "WORK":
        return <WorkIcon className="text-sm" />;
      default:
        return <BuildingIcon className="text-sm" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Header & Back Button */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Button
              onClick={() => navigate("/account")}
              variant="outline"
              className="flex items-center gap-2 mb-3 bg-purple-600 hover:bg-purple-700 text-white border-none"
            >
              <ArrowLeftIcon /> Back to Account
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <MapPinIcon className="text-purple-600" /> My Saved Addresses
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your delivery locations for faster checkout
            </p>
          </div>

          <Button
            onClick={handleOpenAddModal}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center gap-2 h-11 px-5 rounded-xl shadow-md transition-all hover:scale-[1.02]"
          >
            <PlusIcon /> Add New Address
          </Button>
        </div>

        {/* Addresses Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground">
            Loading your saved addresses...
          </div>
        ) : isError ? (
          <div className="py-12 text-center text-red-500 bg-red-50 rounded-2xl border border-red-200 dark:bg-red-500/10 dark:border-red-500/20">
            Failed to load addresses. Please log in again.
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-card rounded-3xl p-12 text-center border border-border shadow-sm flex flex-col items-center justify-center my-6">
            <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4 dark:bg-purple-900/30 dark:text-purple-300">
              <MapPinIcon className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Saved Addresses Found</h3>
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              You haven't added any delivery addresses yet. Add an address now to enjoy a seamless checkout experience.
            </p>
            <Button
              onClick={handleOpenAddModal}
              className="bg-purple-600 hover:bg-purple-700 text-white h-11 px-6 rounded-xl"
            >
              <PlusIcon className="mr-2" /> Add Your First Address
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`relative bg-card rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md ${
                  addr.is_default
                    ? "border-purple-600 ring-2 ring-purple-600/20 dark:ring-purple-600/40"
                    : "border-border hover:border-purple-300"
                }`}
              >
                <div>
                  {/* Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                      {renderBadgeIcon(addr.address_type)} {addr.address_type}
                    </span>

                    {addr.is_default && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                        <StarIcon className="text-xs" /> DEFAULT ADDRESS
                      </span>
                    )}
                  </div>

                  {/* Name & Phone */}
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {addr.full_name}
                  </h3>
                  <p className="text-sm text-purple-600 font-semibold mb-3 dark:text-purple-400">
                    📞 {addr.phone_number}
                  </p>

                  {/* Full Address */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {addr.street_address}, {addr.city}, {addr.state} -{" "}
                    <span className="font-bold text-foreground">{addr.postal_code}</span>, {addr.country}
                  </p>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                  {!addr.is_default ? (
                    <button
                      type="button"
                      onClick={() => defaultMutation.mutate(addr.id)}
                      disabled={defaultMutation.isPending}
                      className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition dark:text-purple-400 dark:hover:text-purple-300"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <CheckIcon className="text-green-600" /> Default for Orders
                    </span>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(addr)}
                      className="p-2 text-muted-foreground hover:text-purple-600 transition rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      title="Edit Address"
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this address?")) {
                          deleteMutation.mutate(addr.id);
                        }
                      }}
                      className="p-2 text-muted-foreground hover:text-red-600 transition rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete Address"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Address Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/40">
              <h2 className="text-xl font-bold text-foreground">
                {editingId ? "Edit Saved Address" : "Add New Address"}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 text-muted-foreground hover:text-foreground rounded-full transition"
              >
                <TimesIcon className="text-lg" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Receiver's name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone_number">Phone Number *</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="street_address">House / Flat No, Street Address *</Label>
                <textarea
                  id="street_address"
                  rows={3}
                  placeholder="Door No, Building, Street, Area / Landmark"
                  value={formData.street_address}
                  onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                  className="w-full mt-1 p-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-purple-500/40"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="e.g. Bengaluru"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="e.g. Karnataka"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postal_code">PIN Code / Postal Code *</Label>
                  <Input
                    id="postal_code"
                    type="text"
                    placeholder="e.g. 560038"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Address Type Selector */}
              <div>
                <Label className="block mb-2">Address Type</Label>
                <div className="flex items-center gap-3">
                  {(["HOME", "WORK", "OTHER"] as AddressType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, address_type: type })}
                      className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        formData.address_type === type
                          ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                          : "bg-background border-border text-muted-foreground hover:border-purple-300"
                      }`}
                    >
                      {renderBadgeIcon(type)} {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Checkbox */}
              <div className="pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-600"
                  />
                  Set as default delivery address
                </label>
              </div>

              {/* Submit / Cancel Footer */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  variant="outline"
                  className="rounded-xl px-5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingId
                    ? "Update Address"
                    : "Save Address"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Addresses;
