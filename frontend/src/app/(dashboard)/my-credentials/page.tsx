import { CreateCredential } from "@/components/modules/credentials/CreateCredential";

export default function MyCredentialsPage() {
  return <CreateCredential showOnlyMyCredentials={true} />;
}