// Shown above an empty table for features whose backend endpoint doesn't exist yet.
export default function NotConnected({ what, endpoint, flag }) {
  return (
    <div className="notice" role="note">
      <strong>{what} aren't connected yet.</strong>{" "}
      This list stays empty until the backend provides <code>{endpoint}</code>. Then set <code>{flag}=true</code> in the frontend environment and rebuild.
    </div>
  );
}
