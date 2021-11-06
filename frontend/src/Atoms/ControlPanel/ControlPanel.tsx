import React from 'react';
import './ControlPanel.scss';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStepForward } from "@fortawesome/free-solid-svg-icons";
import { faStepBackward } from "@fortawesome/free-solid-svg-icons";

export const ControlPanel = () => {
    return (
        <div className="control-panel">
            <div className="back-foward">
            <FontAwesomeIcon icon={faStepBackward} />
            <FontAwesomeIcon icon={faStepForward} />
            </div>
        </div>
    );
}