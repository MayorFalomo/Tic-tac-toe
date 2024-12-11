import React from 'react';

type Props = {
  isVisible: boolean; // Control visibility of the line
};

const CrossLine = ({ isVisible }: Props) => {
  return <div className={`draw-line ${isVisible ? 'visible' : ''}`}> </div>;
};

export default CrossLine;
