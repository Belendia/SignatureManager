import React, { useEffect, useState } from 'react'
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime'
import { Modal, ModalTitle, ModalContent, ModalActions, Button } from '@dhis2/ui'

const attributesQuery = {
    attributes: {
        resource: 'attributes',
        params: {
            paging: false,
            fields: 'id,name,valueType,userAttribute'
        }
    }
}

const currentSettingQuery = {
    current: {
        resource: 'dataStore/SignatureManager/signatureAttributeUid'
    }
}

const createSettingMutation = {
    resource: 'dataStore/SignatureManager/signatureAttributeUid',
    type: 'create',
    data: ({ value }) => value
}

const updateSettingMutation = {
    resource: 'dataStore/SignatureManager/signatureAttributeUid',
    type: 'update',
    data: ({ value }) => value
}

export default function SettingsModal({ open, onClose, onSelectAttribute }) {
    const [selected, setSelected] = useState('')
    const [createSetting] = useDataMutation(createSettingMutation)
    const [updateSetting] = useDataMutation(updateSettingMutation)

    const {
        data: attrData,
        loading,
        error,
        refetch: refetchAttrs
    } = useDataQuery(attributesQuery, { lazy: true })

    const {
        data: currentData,
        refetch: refetchCurrent
    } = useDataQuery(currentSettingQuery, { lazy: true })

    useEffect(() => {
        if (open) {
            Promise.all([refetchAttrs(), refetchCurrent()]).then(([, { current }]) => {
                if (current) setSelected(current)
            })
        }
    }, [open, refetchAttrs, refetchCurrent])

    const handleSave = async () => {
        try {
            if (currentData?.current) {
                await updateSetting({ value: selected })
            } else {
                await createSetting({ value: selected })
            }
            onSelectAttribute(selected)
            onClose()
        } catch (e) {
            console.error('Failed to save setting:', e)
        }
    }

    if (!open) return null

    const attributes = Array.isArray(attrData?.attributes?.attributes)
        ? attrData.attributes.attributes.filter(
              (a) => a.userAttribute === true && a.valueType === 'LONG_TEXT'
          )
        : []

    return (
        <Modal onClose={onClose} position="middle" open={open} large>
            <ModalTitle>Select Signature Attribute</ModalTitle>
            <ModalContent>
                {loading ? (
                    <p>Loading attributes...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>Failed to load attributes</p>
                ) : (
                    <select
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem' }}
                    >
                        <option value="">-- Select an attribute --</option>
                        {attributes.map((attr) => (
                            <option key={attr.id} value={attr.id}>
                                {attr.name}
                            </option>
                        ))}
                    </select>
                )}
            </ModalContent>
            <ModalActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button primary onClick={handleSave} disabled={!selected} style={{ marginLeft: '1rem' }}>
                    Save
                </Button>
            </ModalActions>
        </Modal>
    )
}
