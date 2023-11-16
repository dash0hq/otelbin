// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useReactFlow, getNodesBounds, getViewportForBounds } from 'reactflow';
import { ImageDown } from "lucide-react";
import { Button } from "~/components/button";
import { toPng } from 'html-to-image';

const downloadImage = (dataUrl: string) => {
  const a = document.createElement('a');

  a.setAttribute('download', 'collector-image.png');
  a.setAttribute('href', dataUrl);
  a.click();
};

export function DownloadImageButton() {
  const { getNodes } = useReactFlow();

  const handleKeyPress = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick();
    }
  };

  const onClick = () => {
    const nodes = getNodes()
    const nodesBounds = getNodesBounds(nodes)
    const {x, y, zoom} = getViewportForBounds(nodesBounds, nodesBounds.width, nodesBounds.height, 0.5, 2)

    toPng(document.querySelector('.react-flow__viewport') as HTMLElement, {
      backgroundColor: '#333333',
      pixelRatio: 2,
      width: nodesBounds.width,
      height: nodesBounds.height,
      style: {
        width: nodesBounds.width.toString() ,
        height: nodesBounds.height.toString(),
        transform: `translate(${x}px, ${y}px) scale(${zoom})`,
      },
    }).then(downloadImage);
  };

  return (
    <Button asChild size="xs">
      <a style={{cursor: 'pointer'}} onClick={onClick} onKeyDown={handleKeyPress} tabIndex={0}>
        <ImageDown className="mr-1" />
        Download Image
      </a>
    </Button>
  );
}