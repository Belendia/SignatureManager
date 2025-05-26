import React, { useState } from 'react';
import { Button, Modal, ModalTitle, ModalContent, ModalActions } from '@dhis2/ui';
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime';

const getUserQuery = {
    user: {
        resource: 'users',
        id: ({ id }) => id,
        params: {
            // fields: 'id,username,firstName,surname,email,userRoles[id],organisationUnits[id],attributeValues'
            fields: ":all"
        }
    }
};

const updateUserMutation = {
    resource: 'users',
    type: 'update',
    id: ({ id }) => id,
    data: ({ user }) => user
};

export default function UploadSignatureModal({ open, onClose, user, attributeUid, onSuccess }) {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mutate] = useDataMutation(updateUserMutation);
    const { refetch: refetchUser } = useDataQuery(getUserQuery, { lazy: true });

    const handleUpload = async (file) => {
        if (!file || file.type !== 'image/png') {
            setError('Only PNG images are allowed');
            return;
        }

        const img = new Image();
        img.onload = async () => {
            if (img.width !== 100 || img.height !== 60) {
                setError('Image must be exactly 100x60 pixels');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    setLoading(true);
                    const base64 = reader.result.split(',')[1];

                    const { user: fullUser } = await refetchUser({ id: user.id });

                    const updatedAttributes = [
                        ...(fullUser.attributeValues || []).filter(a => a.attribute?.id !== attributeUid && a.attribute !== attributeUid),
                        {
                            attribute: { id: attributeUid },
                            value: base64
                        }
                    ];

                    await mutate({
                        id: user.id,
                        user: {
                            ...fullUser,
                            attributeValues: updatedAttributes
                        }
                    });

                    onSuccess();
                    onClose();
                } catch (err) {
                    if (err?.details?.httpStatusCode === 409) {
                        setError('Conflict error: user must retain at least one user role.');
                    } else {
                        setError('Failed to upload signature');
                    }
                } finally {
                    setLoading(false);
                }
            };
            reader.readAsDataURL(file);
        };
        img.onerror = () => setError('Invalid image file');
        img.src = URL.createObjectURL(file);
    };

    return (
        open ? (
            <Modal onClose={onClose} position="middle">
                <ModalTitle>Upload Signature</ModalTitle>
                <ModalContent>
                    <input type="file" accept="image/png" onChange={e => handleUpload(e.target.files[0])} disabled={loading} />
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </ModalContent>
                <ModalActions>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                </ModalActions>
            </Modal>
        ) : null
    );
}
