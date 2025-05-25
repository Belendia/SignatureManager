import React, { useState } from 'react';
import { Button, Modal, ModalTitle, ModalContent, ModalActions } from '@dhis2/ui';
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime';

const getUserQuery = {
    user: {
        resource: 'users',
        id: ({ id }) => id,
        params: {
            fields: 'id,username,firstName,surname,email,userRoles[id],organisationUnits[id],attributeValues'
        }
    }
};

const updateUserMutation = {
    resource: 'users',
    type: 'update',
    id: ({ id }) => id,
    data: ({ user }) => user
};

export default function DeleteSignatureModal({ open, onClose, user, attributeUid, onSuccess }) {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mutate] = useDataMutation(updateUserMutation);
    const { refetch: refetchUser } = useDataQuery(getUserQuery, { lazy: true });

    const handleDelete = async () => {
        try {
            setLoading(true);
            const { user: fullUser } = await refetchUser({ id: user.id });

            const updatedAttributes = [
                ...(fullUser.attributeValues || []).filter(
                    a => (typeof a.attribute === 'string' ? a.attribute !== attributeUid : a.attribute?.id !== attributeUid)
                ),
                {
                    attribute: { id: attributeUid },
                    value: ''
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
            setError('Failed to delete signature');
        } finally {
            setLoading(false);
        }
    };

    return (
        open ? (
            <Modal onClose={onClose} position="middle" large>
                <ModalTitle>Confirm Delete Signature</ModalTitle>
                <ModalContent>
                    Are you sure you want to delete the signature for user <strong>{user?.username}</strong>?
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </ModalContent>
                <ModalActions>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button destructive onClick={handleDelete} disabled={loading} style={{ marginLeft: '1rem' }}>Delete</Button>
                </ModalActions>
            </Modal>
        ) : null
    );
}
