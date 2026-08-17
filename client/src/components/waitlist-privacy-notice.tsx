export default function WaitlistPrivacyNotice({
  className = "text-sm text-stone-600 mt-3 max-w-xl",
}: {
  className?: string;
}) {
  return (
    <p className={className}>
      This form collects contact and placement information so we can follow up about availability.{" "}
      <a href="/privacy-policy" className="underline hover:text-stone-900">
        Privacy Policy
      </a>
    </p>
  );
}
