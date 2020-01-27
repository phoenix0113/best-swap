import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse as AntdCollapse } from 'antd';

import { CollapseWrapper } from './collapse.style';
import Label from '../label';

const { Panel } = AntdCollapse;

class Collapse extends Component {
  render() {
    const { data, className, ...props } = this.props;

    return (
      <CollapseWrapper
        className={`collapse-wrapper ${className}`}
        bordered={false}
        {...props}
      >
        {data.map((value, index) => {
          const { question, answer } = value;

          return (
            <Panel
              header={question}
              className="collapse-panel-wrapper"
              key={index}
            >
              <Label size="big" color="normal">
                {answer}
              </Label>
            </Panel>
          );
        })}
      </CollapseWrapper>
    );
  }
}

Collapse.propTypes = {
  data: PropTypes.array,
  className: PropTypes.string,
};

Collapse.defaultProps = {
  data: [],
  className: '',
};

export default Collapse;
