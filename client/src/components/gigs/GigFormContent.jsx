import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createGig, getCategories, getGig, updateGig } from "../../api/gigApi";
import { ROUTES } from "../../utils/constants";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import LoadingState from "../ui/LoadingState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "",
  price: "",
  deliveryTime: "",
  tags: "",
};

const getErrorMessage = (error, fallback) => error?.response?.data?.message || fallback;

const GigFormContent = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getCategories()
      .then((response) => {
        if (isMounted) {
          setCategories(response?.data?.data || []);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isEditing) {
      return undefined;
    }

    let isMounted = true;

    const fetchGig = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await getGig(id);
        const gig = response?.data?.data;

        if (isMounted && gig) {
          setForm({
            title: gig.title || "",
            description: gig.description || "",
            category: gig.category || "",
            price: gig.price ?? "",
            deliveryTime: gig.deliveryTime ?? "",
            tags: (gig.tags || []).join(", "),
          });
          setImagePreview(gig.image || "");
        }
      } catch {
        if (isMounted) {
          setLoadError("Couldn't load this gig.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchGig();

    return () => {
      isMounted = false;
    };
  }, [id, isEditing]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaveError("");
    setSaving(true);

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("category", form.category);
    formData.append("price", form.price);
    formData.append("deliveryTime", form.deliveryTime);
    formData.append("tags", JSON.stringify(tags));

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (isEditing) {
        await updateGig(id, formData);
      } else {
        await createGig(formData);
      }
      navigate(ROUTES.freelancerMyGigs);
    } catch (error) {
      setSaveError(getErrorMessage(error, `Couldn't ${isEditing ? "update" : "create"} this gig.`));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">
        {isEditing ? "Edit gig" : "Add gig"}
      </h1>
      <p className="mt-1 text-text-secondary">
        {isEditing ? "Update the details clients see for this gig." : "Publish a new gig for clients to order."}
      </p>

      {loading ? <LoadingState label="Loading gig..." /> : null}
      {loadError ? <p className="mt-6 text-danger-text">{loadError}</p> : null}

      {!loading && !loadError ? (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Gig details</CardTitle>
            <CardDescription>Fields marked required must be filled in before publishing.</CardDescription>
          </CardHeader>

          <CardContent>
            <form id="gig-form" className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. I will build a responsive React website"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe what's included in this gig..."
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="1"
                    step="1"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="deliveryTime">Delivery time (days)</Label>
                  <Input
                    id="deliveryTime"
                    name="deliveryTime"
                    type="number"
                    min="1"
                    step="1"
                    value={form.deliveryTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  type="text"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="Comma-separated, e.g. react, node, api"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image">Image</Label>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Gig preview"
                    className="aspect-video w-full max-w-sm rounded-lg border border-border object-cover"
                  />
                ) : null}
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!isEditing}
                />
              </div>

              {saveError ? <p className="text-sm text-danger-text">{saveError}</p> : null}
            </form>
          </CardContent>

          <CardFooter className="gap-3">
            <Button type="submit" form="gig-form" disabled={saving}>
              {saving ? "Saving..." : isEditing ? "Save changes" : "Publish gig"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.freelancerMyGigs)}>
              Cancel
            </Button>
          </CardFooter>
        </Card>
      ) : null}
    </>
  );
};

export default GigFormContent;
