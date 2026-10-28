import React, { Component } from 'react';
import { PlayerPhoto } from '../../types';
import '../../style/PlayerAvatar.css';

interface PlayerAvatarProps {
    name: string;
    photo: PlayerPhoto | null;
    // sets the size; see .summary-photo and .profile-photo
    className: string;
}

// "Karl Malone" -> "KM", shown until a photo loads, or in place of one
const initials = (name: string): string => {
    const parts = name.split(/\s+/).filter(Boolean);
    return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : name.slice(0, 2);
};

class PlayerAvatar extends Component<PlayerAvatarProps> {
    render() {
        const { name, photo, className } = this.props;
        return (
            <div className={`avatar ${className}`}>
                <span className="avatar-initials" aria-hidden="true">{initials(name)}</span>
                {photo &&
                    <img
                        key={photo.url}
                        src={photo.url}
                        alt={name}
                        onError={e => e.currentTarget.remove()}
                    />
                }
            </div>
        );
    }
}

export default PlayerAvatar;
