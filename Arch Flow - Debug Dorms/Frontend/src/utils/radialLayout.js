/**
 * Radial Layout Engine (Map UI Version) - STRICT FIXED VERSION
 * Positions folders in a large outer circle and files in satellite clusters around them.
 */
export function applyRadialLayout(nodes, edges, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const folderRadius = 550; 
    
    const folders = nodes.filter(n => n.type === 'folder');
    const files = nodes.filter(n => n.type === 'file');
    
    // 1. Position Folders (City Centers)
    folders.forEach((folder, i) => {
        const angle = (i / folders.length) * 2 * Math.PI;
        folder.position = {
            x: centerX + folderRadius * Math.cos(angle),
            y: centerY + folderRadius * Math.sin(angle)
        };
    });

    // 2. Groups files by Folder
    const folderGroups = {};
    files.forEach(file => {
        // SPECIAL RULE: Entry Node lives in the center
        if (file.data.isEntry) {
            file.position = { x: centerX, y: centerY };
            return;
        }

        const parentFolderId = file.data.folder;
        if (!folderGroups[parentFolderId]) folderGroups[parentFolderId] = [];
        folderGroups[parentFolderId].push(file);
    });

    Object.entries(folderGroups).forEach(([folderId, group]) => {
        const parent = folders.find(f => f.id === folderId);
        const parentX = parent ? parent.position.x : centerX;
        const parentY = parent ? parent.position.y : centerY;
        
        const totalFiles = group.length;
        const satelliteRadius = Math.max(140, totalFiles * 22); // Increased spacing

        group.forEach((file, i) => {
            const angle = (i / totalFiles) * 2 * Math.PI;
            file.position = {
                x: parentX + satelliteRadius * Math.cos(angle),
                y: parentY + satelliteRadius * Math.sin(angle)
            };
        });
    });

    return nodes;
}
