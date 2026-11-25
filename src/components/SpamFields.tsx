"use client";

import { useEffect, useState } from "react";

export function SpamFieldsClient() {
  const [started, setStarted] = useState("");
  useEffect(() => {
    setStarted(String(Date.now()));
  }, []);

  return (
    <>
      <div className="hp" aria-hidden="true">
        <label>
          Company website
          <input name="company_url" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input type="hidden" name="form_started" value={started} />
    </>
  );
}
