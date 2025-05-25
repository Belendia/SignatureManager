import React, { useEffect, useState } from 'react';
import { useDataQuery, useDataEngine } from '@dhis2/app-runtime';
import {OrgUnitTree} from './OrgUnitTree';

export default function OrgUnitList({ onSelect }) {
    const [selectedId, setSelectedId] = useState(null);
    const [orgUnits, setOrgUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const engine = useDataEngine();

    const { data: meData, loading: meLoading } = useDataQuery({
        me: {
            resource: 'me',
            params: {
                fields: 'organisationUnits[id,displayName,leaf]'
            }
        }
    });

    const fetchChildren = async (parentId) => {
        const { organisationUnit } = await engine.query({
            organisationUnit: {
                resource: `organisationUnits/${parentId}`,
                params: { fields: 'children[id,displayName,leaf]' }
            }
        });
        return organisationUnit.children || [];
    };

    useEffect(() => {
        if (meData?.me?.organisationUnits) {
            const sorted = [...meData.me.organisationUnits].sort((a, b) =>
                a.displayName.localeCompare(b.displayName)
            );
            setOrgUnits(sorted);
            setLoading(false);
        }
    }, [meData]);

    if (loading || meLoading) return <p style={{ width: '20%', padding: 10 }}>Loading org units...</p>;

    return (
        <div
            style={{
                width: '20%',
                borderRight: '1px solid #ccc',
                padding: 10,
                overflowY: 'auto',
                overflowX: 'auto',               
                whiteSpace: 'nowrap'             
            }}>
            <h3>Org Units</h3>
            <OrgUnitTree orgUnits={orgUnits} onSelect={(id) => { setSelectedId(id); onSelect(id); }} fetchChildren={fetchChildren} selectedId={selectedId} />
        </div>
    );
}
