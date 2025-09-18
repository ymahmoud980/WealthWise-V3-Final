# Document Storage

This folder is used to store documents for your assets and liabilities.

## How to Use

1.  For each asset or liability, create a new folder inside this `documents` directory.
2.  The name of the new folder **must** be the ID of the item. You can find the ID on the "Documents" page in the app.
3.  Place your files (PDFs, images, etc.) inside the folder you just created.
4.  Finally, open `src/lib/data.ts` in the editor, find the corresponding item, and add the filename to its `documents` array.

For example, for an asset with ID `re1-apt1` and a file named `contract.pdf`:
- Create the folder: `public/documents/re1-apt1/`
- Place the file inside: `public/documents/re1-apt1/contract.pdf`
- Update the data: `documents: [{ name: "contract.pdf" }]`
