# What's included

## Document Actions

The `document-actions` menu provides the list of actions that the current user may perform against the current document.

The following examples are provided:

- `config/oup-ui/blocks/default/document-actions/hide-change-qname-for-a-project.json`
Hides the "Change QName" action for all documents in a given project.

- `config/oup-ui/blocks/default/document-actions/hide-change-qname-for-a-user-group.json`
Hides the "Change QName" action for all documents where the current user doesn't have a specified authority over the document.

- `config/oup-ui/blocks/default/document-actions/hide-change-qname-for-a-user.json`
Hides the "Change QName" action for a specific user.

- `config/oup-ui/blocks/default/document-actions/hide-delete-document-for-a-content-type.json`
Hides the "Delete Document" action for a content item of a given type.

- `config/oup-ui/blocks/default/document-actions/hide-delete-document-for-a-page-type.json`
Hides the "Delete Document" action for a content item of a given type.

## Documents List Buttons

The `documents-list-buttons` menu is the top button selection that you see when you're browsing folders in the document library.
This includes things like "Create" and "View Properties".

The following examples are provided:

- `config/oup-ui/blocks/default/documents-list-buttons/adjust-documents-list-buttons-for-path.json`
When browsing a folder at a specified path, remove the `new_text_file` button and change the name of the `new_document`
menu option to `Create Page Template`.  Removes `view_rules`, `view_details` and the sort and actions selectors.

- `config/oup-ui/blocks/default/documents-list-buttons/adjust-documents-list-buttons-for-type.json`
When browsing a folder of a specific type, remove the `new_text_file` button and change the name of the `new_document`
menu option to `Create Page Template`.  Removes `view_rules`, `view_details` and the sort and actions selectors.

- `config/oup-ui/blocks/default/documents-list-buttons/create-journal-for-path.json`
Adds a menu option to the Create menu for a folder at the given path.

- `config/oup-ui/blocks/default/documents-list-buttons/create-journal-for-type.json`
Adds a menu option to the Create menu for a folder of the given type.

- `config/oup-ui/blocks/default/documents-list-buttons/create-journal.json`
Adds a menu option to the Create menu for all folders.

## Documents List Selected Actions

The `documents-list-selected-actions` menu consists of the right-side dropdown that provides actions that run against the 
currently selected set of items from the table (using checkboxes).

The following examples are provided:

- `config/oup-ui/blocks/default/documents-list-selected-actions/remove-delete-selected-action-for-path.json`
Removes the `Delete...` selected actions item for items within a folder at a specified path.

- `config/oup-ui/blocks/default/documents-list-selected-actions/remove-delete-selected-action-for-type.json`
Removes the `Delete...` selected actions item for items within a folder of a specified type.

## Project Context

The `project-context` menu is the left-hand menu that you get when you're inside of a project.

The following examples are provided:

- `config/oup-ui/blocks/default/project-context/project.json`
Adds a new menu item to the left-hand side that serves as a link into the document library.

- `config/oup-ui/blocks/default/project-context/rename-content-to-page-templates.json`
Renames the `Content` menu item to `Page Templates`.

- `config/oup-ui/blocks/default/project-context/rename-documents-to-content-library.json`
Renames the `Documents` menu item to `Content Library`.

## Document Sub-Context

The `document-subcontext` menu is the left-hand navigation sub-menu that appears when you view a document.

The following examples are provided:

- `config/oup-ui/blocks/default/document-subcontext/hide-actions-for-a-project.json`
Hide the "Actions" menu in the Document left-hand navigation for a given project.

- `config/oup-ui/blocks/default/document-subcontext/hide-actions-for-a-user-group.json`
Hide the "Actions" menu in the Document left-hand navigation for a user lacking a specific authority.

- `config/oup-ui/blocks/default/document-subcontext/hide-actions-for-a-user.json`
Hide the "Actions" menu in the Document left-hand navigation for a specific user.



