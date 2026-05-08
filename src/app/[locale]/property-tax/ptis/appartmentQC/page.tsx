
import { redirect } from "next/navigation";

export default function AppartmentQCPage() {
    // Redirect to amenities tab by default
    redirect("./appartmentQC/amenities");
}
