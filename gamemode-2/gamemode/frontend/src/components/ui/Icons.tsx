import * as React from "react";

const iconSize = "1.2em";

export const IconSkull: React.FC<{ size?: string; className?: string }> = ({ size = iconSize, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.55 1.69-4.9L7.6 10.4l1.4 1.4-2.31 2.31c.78.47 1.65.79 2.62.94L8 16h2l.5-2h3l.5 2h2l-2.31-1.35c.97-.15 1.84-.47 2.62-.94L15 11.8l1.4-1.4 1.91 1.91C18.37 8.45 20 10.15 20 12c0 4.41-3.59 8-8 8zm-2-9c-.83 0-1.5-.67-1.5-1.5S9.17 8 10 8s1.5.67 1.5 1.5S10.83 11 10 11zm4 0c-.83 0-1.5-.67-1.5-1.5S13.17 8 14 8s1.5.67 1.5 1.5S14.83 11 14 11z" />
    </svg>
);

export const IconUsers: React.FC<{ size?: string; className?: string }> = ({ size = iconSize, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
);

export const IconGun: React.FC<{ size?: string; className?: string }> = ({ size = iconSize, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20.5 4.5l-2-2c-.28-.28-.72-.28-1 0l-2 2 2 2 1.5-1.5 1 1-2 2 2 2 1-1 1.5 1.5 2-2c.28-.28.28-.72 0-1l-2-2zM6.5 8.5L4 11h2.5l1-1-1-1.5zM4 20h16v2H4v-2zm10-9.5l-1 1 1.5 1.5 1-1-1.5-1.5zM12 2v2h2V2h-2zm-2 4H8V4h2v2zm4 0h-2V4h2v2zm-4 8h2v6h-2v-6zm4 0h2v6h-2v-6z" />
    </svg>
);

export const IconUser: React.FC<{ size?: string; className?: string }> = ({ size = iconSize, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
);
