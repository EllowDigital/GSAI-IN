
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EventImageUploader from "./EventImageUploader";
import Spinner from "@/components/ui/spinner";
import { Tables } from "@/integrations/supabase/types";
import { Calendar } from "@/components/ui/calendar";

type EventRow = Tables<"events">;

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEvent: EventRow | null;
}

const EMPTY: Partial<EventRow> = {
  title: "",
  description: "",
  image_url: "",
  from_date: "",
  end_date: "",
  tag: "",
};

const AdminEventFormModal: React.FC<ModalProps> = ({ open, onOpenChange, editingEvent }) => {
  const [form, setForm] = useState<Partial<EventRow>>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (editingEvent) {
      setForm(editingEvent);
      setImagePreview(editingEvent.image_url ?? null);
    } else {
      setForm(EMPTY);
      setImagePreview(null);
    }
    setImageFile(null);
  }, [editingEvent, open]);

  const handleChange = (key: keyof EventRow, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleDateChange = (key: "from_date" | "end_date", date: Date | undefined) => {
    handleChange(key, date ? date.toISOString().slice(0, 10) : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.title?.trim() ||
      !form.description?.trim() ||
      !form.from_date ||
      !form.end_date
    ) {
      toast.error("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      let image_url = form.image_url ?? "";
      // If new image selected, upload
      if (imageFile) {
        const filename = `${Date.now()}-${imageFile.name}`;
        const { data, error } = await supabase.storage
          .from("events")
          .upload(filename, imageFile, { upsert: true });
        if (error) throw error;
        const { data: publicUrlData } = supabase.storage
          .from("events")
          .getPublicUrl(filename);
        if (publicUrlData?.publicUrl) {
          image_url = publicUrlData.publicUrl;
        }
      }

      if (editingEvent) {
        // Update
        const { error } = await supabase
          .from("events")
          .update({
            title: form.title,
            description: form.description,
            image_url,
            from_date: form.from_date,
            end_date: form.end_date,
            tag: form.tag,
          })
          .eq("id", editingEvent.id);
        if (error) throw error;
        toast.success("Event updated.");
      } else {
        // Create
        const { error } = await supabase.from("events").insert([
          {
            title: form.title,
            description: form.description,
            image_url,
            from_date: form.from_date,
            end_date: form.end_date,
            tag: form.tag,
          },
        ]);
        if (error) throw error;
        toast.success("Event created.");
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Failed to save event.", err.message);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
          <DialogDescription>All fields required.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            placeholder="Title"
            value={form.title ?? ""}
            onChange={(e) => handleChange("title", e.target.value)}
            required
          />
          <Textarea
            placeholder="Description"
            rows={4}
            value={form.description ?? ""}
            onChange={(e) => handleChange("description", e.target.value)}
            required
          />
          <EventImageUploader
            imageFile={imageFile}
            setImageFile={setImageFile}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            onRemoveImage={() => {
              setImageFile(null);
              setImagePreview(null);
              setForm((f) => ({ ...f, image_url: "" }));
            }}
          />
          <div className="flex gap-3">
            <div>
              <div className="font-medium mb-1 text-sm">From Date</div>
              <Calendar
                mode="single"
                selected={form.from_date ? new Date(form.from_date) : undefined}
                onSelect={(date) => handleDateChange("from_date", date)}
                initialFocus
              />
            </div>
            <div>
              <div className="font-medium mb-1 text-sm">End Date</div>
              <Calendar
                mode="single"
                selected={form.end_date ? new Date(form.end_date) : undefined}
                onSelect={(date) => handleDateChange("end_date", date)}
                initialFocus
              />
            </div>
          </div>
          <Input
            placeholder="Tag (optional, e.g. Seminar, Tournament)"
            value={form.tag ?? ""}
            onChange={(e) => handleChange("tag", e.target.value)}
            maxLength={32}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="rounded-xl">
              {loading ? <Spinner size={16} /> : editingEvent ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminEventFormModal;
