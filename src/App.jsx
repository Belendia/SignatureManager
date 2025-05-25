import React, { useState, useEffect } from 'react';
import { useDataQuery } from '@dhis2/app-runtime';
import OrgUnitList from './components/orgunit';
import {UserList} from './views';
import {UploadSignatureModal, DeleteSignatureModal, SettingsModal} from './components/modals';
import { IconSettings24 } from '@dhis2/ui-icons';
import { Button, AlertBar, CircularLoader } from '@dhis2/ui';

const systemSettingQuery = {
    signatureSetting: {
        resource: 'dataStore/SignatureManager/signatureAttributeUid',
    }
};

const usersQuery = {
    users: {
        resource: 'users',
        params: ({ orgUnit }) => ({
            filter: `organisationUnits.id:eq:${orgUnit}`,
            fields: 'id,firstName, surname, username,organisationUnits[id],attributeValues[attribute,value]'
        })
    }
};

export default function App() {
    const [orgUnitId, setOrgUnitId] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [signatureAttributeUid, setSignatureAttributeUid] = useState(null);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);

    const { data: settingData, error: settingError } = useDataQuery(systemSettingQuery);

    const {
        data: userData,
        loading: loadingUsers,
        refetch: refetchUsers
    } = useDataQuery(usersQuery, {
        variables: { orgUnit: orgUnitId },
        lazy: true
    });

    const handleDeleteRequest = (user) => {
        setSelectedUserForDelete(user);
        setShowDeleteModal(true);
    };

    useEffect(() => {
        if (settingError) {
            setSignatureAttributeUid(null);
        } else if (settingData?.signatureSetting) {
            setSignatureAttributeUid(settingData.signatureSetting);
        }
    }, [settingData, settingError]);

    useEffect(() => {
        if (orgUnitId && signatureAttributeUid) {
            refetchUsers({ orgUnit: orgUnitId })
                .then(({ users }) => {
                    setUsers(users.users || []);
                    setError(null);
                })
                .catch(() => {
                    setError('Failed to load users');
                    setUsers([]);
                });
        }
    }, [orgUnitId, signatureAttributeUid]);

    useEffect(() => {
        if (userData?.users?.users) {
            setUsers(userData.users.users);
            setError(null);
        }
    }, [userData]);

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <OrgUnitList onSelect={setOrgUnitId} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 10 }}>
                    <Button icon={<IconSettings24 />} onClick={() => setShowSettings(true)}>
                        Settings
                    </Button>
                </div>
                {signatureAttributeUid ? (
                    loadingUsers ? (
                        <div style={{ padding: 20 }}><CircularLoader small /></div>
                    ) : (
                        <UserList
                            users={users}
                            onEdit={user => {
                                setSelectedUser(user);
                                setShowModal(true);
                            }}
                            onDelete={handleDeleteRequest}
                            attributeUid={signatureAttributeUid}
                        />
                    )
                ) : (
                    <AlertBar warning duration={0}>
                        No signature attribute selected. Please select one in settings.
                    </AlertBar>
                )}
            </div>
            <UploadSignatureModal
                open={showModal}
                onClose={() => setShowModal(false)}
                user={selectedUser}
                attributeUid={signatureAttributeUid}
                onSuccess={async () => {
                    const { users } = await refetchUsers({ orgUnit: orgUnitId });
                    setUsers(users.users || []);
                }}
            />
            <DeleteSignatureModal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                user={selectedUserForDelete}
                attributeUid={signatureAttributeUid}
                onSuccess={async () => {
                    const { users } = await refetchUsers({ orgUnit: orgUnitId });
                    setUsers(users.users || []);
                }}
            />
            <SettingsModal
                open={showSettings}
                onClose={() => setShowSettings(false)}
                onSelectAttribute={(uid) => setSignatureAttributeUid(uid)}
            />
        </div>
    );
}
