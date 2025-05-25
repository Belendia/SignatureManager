// File: src/UserList.js
import React, { useState } from 'react';
import { Table, TableHead, TableRow, TableCellHead, TableBody, TableCell, Button, Pagination } from '@dhis2/ui';

const DEFAULT_PAGE_SIZE = 10;

export default function UserList({ users, onEdit, onDelete, attributeUid }) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    const startIndex = (page - 1) * pageSize;
    const currentPageUsers = users.slice(startIndex, startIndex + pageSize);
    const pageCount = Math.ceil(users.length / pageSize);

    return (
        <div style={{ padding: 20, flex: 1, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
            <h3>Users</h3>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCellHead>Display name</TableCellHead>
                        <TableCellHead>Username</TableCellHead>
                        <TableCellHead>Signature</TableCellHead>
                        <TableCellHead>Actions</TableCellHead>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {currentPageUsers.map(user => {
                        const signatureAttr = user.attributeValues?.find(
                            a => (typeof a.attribute === 'string' ? a.attribute === attributeUid : a.attribute?.id === attributeUid)
                        );
                        const signatureImage = signatureAttr ? `data:image/png;base64,${signatureAttr.value}` : null;
                        return (
                            <TableRow key={user.id}>
                                <TableCell>{user.firstName} {user.surname}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>
                                    {signatureImage ? (
                                        <img
                                            src={signatureImage}
                                            alt="signature"
                                            width={100}
                                            height={60}
                                        />
                                    ) : (
                                        '—'
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button small onClick={() => onEdit(user)} style={{ marginRight: 8 }}>Edit</Button>
                                    {signatureImage && (
                                        <Button small destructive onClick={() => onDelete(user)}>Delete</Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            {pageCount > 1 && (
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                        pages={pageCount}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                    />
                </div>
            )}
        </div>
    );
}
