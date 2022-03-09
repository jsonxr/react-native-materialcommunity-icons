import React from 'react';
import { Appearance, ColorValue } from 'react-native';
import { SvgXml, XmlProps } from 'react-native-svg';

export interface MIconProps extends Omit<XmlProps, 'fill' | 'width' | 'height' | 'xml'> {
  color?: ColorValue;
  size?: number;
}
export const createSvgIcon =
  (xml: string) =>
  ({ color, fillOpacity = 1.0, size = 24, ...props }: MIconProps) => {
    const defaultIconColor = Appearance.getColorScheme() === 'light' ? '#000000' : '#ffffff';

    return (
      <SvgXml
        {...props}
        fillOpacity={fillOpacity}
        fill={color ?? defaultIconColor}
        width={size}
        height={size}
        xml={xml}
      />
    );
  };

export interface MIconPropsVariants<T> extends MIconProps {
  variant?: T;
}
export const createSvgIconWithVariants =
  <T extends Record<string, string>>(xml: T) =>
  ({ color, fillOpacity = 1.0, size = 24, variant, ...props }: MIconPropsVariants<keyof T>) => {
    const defaultIconColor = Appearance.getColorScheme() === 'light' ? '#000000' : '#ffffff';
    const value: string = variant ? xml[variant] : xml[Object.keys(xml)[0]];

    return (
      <SvgXml
        {...props}
        fillOpacity={fillOpacity}
        fill={color ?? defaultIconColor}
        width={size}
        height={size}
        xml={value}
      />
    );
  };
