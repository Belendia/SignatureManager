
import {OrgUnitNode} from './OrgUnitNode';

export function OrgUnitTree({ orgUnits, onSelect, fetchChildren, selectedId }) {
    return (
        <ul style={{ listStyleType: 'none', paddingLeft: 15 }}>
            {orgUnits.map((ou) => (
                    <OrgUnitNode
                        key={ou.id}
                        node={ou}
                        onSelect={onSelect}
                        fetchChildren={fetchChildren}
                        selectedId={selectedId}
                    />
                ))}
        </ul>
    );
}