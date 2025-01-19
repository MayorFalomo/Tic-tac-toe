import React, { ReactElement } from 'react';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap.css';

type Props = {
  children: ReactElement;
  title: React.ReactNode;
};

const Showtip: React.FC<Props> = ({ children, title }) => {
  return (
    <Tooltip
      placement="bottom"
      trigger={['hover']}
      overlay={title}
      // overlayClassName="custom-tooltip"
      mouseEnterDelay={0.1}
      mouseLeaveDelay={0.1}
      showArrow={false}
    >
      {children}
    </Tooltip>
  );
};

export default Showtip;
