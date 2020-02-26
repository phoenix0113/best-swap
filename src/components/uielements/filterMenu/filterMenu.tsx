import React, { useCallback, useState, useMemo } from 'react';
import { Icon } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import { Menu, MenuItem } from './filterMenu.style';

import Input from '../input';
import { CoinCardAssetData } from '../coins/coinCard/types';

type Props = {
  onSelect?: (clickParam: ClickParam) => void;
  filterFunction: (item: CoinCardAssetData, searchTerm: string) => boolean;
  searchEnabled?: boolean;
  cellRenderer: (data: CoinCardAssetData) => { key: string; node: JSX.Element };
  data: CoinCardAssetData[];
  disableItemFilter?: (item: CoinCardAssetData) => boolean;
  placeholder?: string;
};

const FilterMenu: React.FC<Props> = ({
  onSelect = _ => {},
  searchEnabled = false,
  data,
  filterFunction,
  cellRenderer,
  disableItemFilter = _ => false,
  placeholder = 'Search Token ...',
  ...otherProps
}): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleClick = useCallback(
    (event: ClickParam) => {
      // (Rudi) bail if this is triggered by the search menu item
      if (!event || !event.key || event.key === '_search') return;

      setSearchTerm('');
      onSelect(event);
    },
    [onSelect],
  );

  const handleSearchChanged = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newSearchTerm = event.currentTarget.value;
      setSearchTerm(newSearchTerm);
    },
    [],
  );

  const filteredData: CoinCardAssetData[] = useMemo(
    () =>
      searchTerm === ''
        ? data
        : data.filter(item => filterFunction(item, searchTerm)),
    [data, filterFunction, searchTerm],
  );

  return (
    <Menu {...otherProps} onClick={handleClick}>
      {searchEnabled && (
        <Menu.Item disabled key="_search">
          <Input
            value={searchTerm}
            onChange={handleSearchChanged}
            placeholder={placeholder}
            typevalue="ghost"
            suffix={<Icon type="search" />}
          />
        </Menu.Item>
      )}
      {filteredData.map((item: CoinCardAssetData) => {
        const { key, node } = cellRenderer(item);
        const disableItem = disableItemFilter(item);

        return (
          <MenuItem disabled={disableItem} key={key}>
            {node}
          </MenuItem>
        );
      })}
    </Menu>
  );
};

export default FilterMenu;
