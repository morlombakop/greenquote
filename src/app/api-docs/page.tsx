import React from "react";
import SwaggerUIClient from "./SwaggerUIClient";
import { openApiSpec } from "./openapi-spec";

export default function ApiDocsPage() {
  return (
    <main className="p-5 bg-white min-h-screen">
      <SwaggerUIClient spec={openApiSpec} />
    </main>
  );
}
