import { useState } from "react";
import { deliverOrder } from "../../api/orderApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

const MAX_FILES = 5;

const DeliverOrderDialog = ({ open, onOpenChange, orderId, onDelivered }) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [linkInput, setLinkInput] = useState("");
  const [links, setLinks] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setMessage("");
    setFiles([]);
    setLinkInput("");
    setLinks([]);
    setError("");
  };

  const handleOpenChange = (nextOpen) => {
    if (submitting) {
      return;
    }

    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  };

  const handleFilesChange = (event) => {
    const selected = Array.from(event.target.files || []);
    setFiles(selected.slice(0, MAX_FILES));
  };

  const handleAddLink = () => {
    const url = linkInput.trim();

    if (!url) {
      return;
    }

    setLinks((prev) => [...prev, url]);
    setLinkInput("");
  };

  const handleLinkKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddLink();
    }
  };

  const handleRemoveLink = (index) => {
    setLinks((prev) => prev.filter((_, linkIndex) => linkIndex !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!message.trim()) {
      setError("Add a message describing what you're delivering.");
      return;
    }

    setError("");
    setSubmitting(true);

    const formData = new FormData();
    formData.append("message", message.trim());
    files.forEach((file) => formData.append("files", file));

    if (links.length > 0) {
      formData.append(
        "attachments",
        JSON.stringify(links.map((url) => ({ url, filename: url }))),
      );
    }

    try {
      const response = await deliverOrder(orderId, formData);
      onDelivered?.(response?.data?.data);
      resetForm();
      onOpenChange(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't submit this delivery.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit delivery</AlertDialogTitle>
          <AlertDialogDescription>
            Let the client know what you&apos;re delivering. They&apos;ll be able to approve it or
            request a revision.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form id="deliver-order-form" className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="delivery-message">Message</Label>
            <Textarea
              id="delivery-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Describe what you've completed..."
              maxLength={2000}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="delivery-files">Attachments (optional, up to {MAX_FILES})</Label>
            <Input id="delivery-files" type="file" multiple onChange={handleFilesChange} />
            {files.length > 0 ? (
              <ul className="text-sm text-text-muted">
                {files.map((file) => (
                  <li key={file.name}>{file.name}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="delivery-link">Links (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="delivery-link"
                type="url"
                value={linkInput}
                onChange={(event) => setLinkInput(event.target.value)}
                onKeyDown={handleLinkKeyDown}
                placeholder="https://..."
              />
              <Button type="button" variant="outline" onClick={handleAddLink}>
                Add
              </Button>
            </div>
            {links.length > 0 ? (
              <ul className="space-y-1">
                {links.map((url, index) => (
                  <li
                    key={`${url}-${index}`}
                    className="flex items-center justify-between gap-2 text-sm text-text-muted"
                  >
                    <span className="truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(index)}
                      className="shrink-0 text-danger-text hover:underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {error ? <p className="text-sm text-danger-text">{error}</p> : null}
        </form>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <Button type="submit" form="deliver-order-form" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit delivery"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeliverOrderDialog;
