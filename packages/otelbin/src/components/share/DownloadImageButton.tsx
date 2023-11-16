// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useReactFlow, getRectOfNodes, getTransformForBounds } from 'reactflow';
import { ImageDown } from "lucide-react";
import { Button } from "~/components/button";
import { toPng } from 'html-to-image';

const downloadImage = (dataUrl: string) => {
  const a = document.createElement('a');

  a.setAttribute('download', 'collector-image.png');
  a.setAttribute('href', dataUrl);
  a.click();
};

const calculateImageDimensions = (nodeCount: number) => {
  const baseWidth = 1024;
  const baseHeight = 768;
  const widthPerNode = 100; 

  const calculatedWidth = Math.max(baseWidth, widthPerNode * nodeCount);

  return {
    width: calculatedWidth,
    height: baseHeight,
  };
}

export function DownloadImageButton() {
  const { getNodes } = useReactFlow();

  const handleKeyPress = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick();
    }
  };

  const onClick = () => {
    const nodes = getNodes()
    const nodesBounds = getRectOfNodes(nodes)
    const { width, height } = calculateImageDimensions(nodes.length);
    const transform = getTransformForBounds(nodesBounds, width, height, 0.5, 2)

    toPng(document.querySelector('.react-flow__viewport') as HTMLElement, {
      backgroundColor: '#333333',
      pixelRatio: 2,
      width: width,
      height: height,
      style: {
        width: width.toString() ,
        height: height.toString(),
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
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