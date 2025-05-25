import React, { useState } from 'react';
import {OrgUnitTree} from './OrgUnitTree';

export function OrgUnitNode({ node, onSelect, fetchChildren, selectedId }) {
    const [expanded, setExpanded] = useState(false);
    const [children, setChildren] = useState(node.children || []);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        if (!expanded && children.length === 0) {
            setLoading(true);
            const fetched = await fetchChildren(node.id);
            setChildren(fetched);
            setLoading(false);
        }
        setExpanded(!expanded);
    };

    const sortedChildren = [...children].sort((a, b) => a.displayName.localeCompare(b.displayName));

    return (
        <li>
            <div
                onClick={() => {
                    handleToggle();
                    onSelect(node.id);
                }}
                style={{ cursor: 'pointer', margin: '5px 0' }}
            >
                {!node.leaf ? (<span style={{ fontSize: '0.6em', display: 'inline-block', width: '1em', marginRight: 4 }}>{expanded ? '▼' : '▶'}</span>) : <span style={{ display: 'inline-block', width: '1em', marginRight: 4 }}></span>}

                <span style={{ fontSize: '0.9em', color: node.id === selectedId ? 'orange' : 'inherit' }}>{node.displayName}</span> {loading && '(loading...)'}
            </div>
            {expanded && children.length > 0 && (
                <OrgUnitTree orgUnits={sortedChildren} onSelect={onSelect} fetchChildren={fetchChildren} selectedId={selectedId} />
            )}
        </li>
    );
}