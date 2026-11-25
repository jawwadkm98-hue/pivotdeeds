import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { FileLibrary } from "@/components/admin/FileLibrary";
import { removeLibrary } from "@/lib/admin-actions";
import { queryValue } from "@/lib/format";
import { listFiles } from "@/lib/inventory";

export default async function FilesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const files = await listFiles();
  const saved = queryValue((await searchParams).saved) === "1";
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8">
      <p className="kicker">Files</p>
      <h1 className="mt-2 font-serif text-4xl font-medium">Documents</h1>
      <p className="mt-2 text-sm text-moss">Contracts and photos stored for the admin only. They are not shown on the public site.</p>
      <div className="mt-6">
        <FileLibrary saved={saved} />
      </div>
      <ul className="mt-6 divide-y divide-sand rounded-3xl border border-sand">
        {files.length === 0 ? <li className="px-4 py-6 text-sm text-moss">No files uploaded.</li> : null}
        {files.map((file) => (
          <li key={file.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <a className="font-semibold underline" href={`/admin/library?id=${file.id}`}>
                {file.name}
              </a>
              <p className="text-xs text-moss">{Math.ceil(file.size_bytes / 1024)} KB</p>
            </div>
            <ConfirmForm action={removeLibrary} message="Delete this file?" label="Delete">
              <input type="hidden" name="id" value={file.id} />
            </ConfirmForm>
          </li>
        ))}
      </ul>
    </div>
  );
}
