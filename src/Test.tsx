import type { GlobalProps } from '@lynx-js/types';
import { useNavigate } from 'react-router';

export function Test() {
    const nav = useNavigate();

    return (
        <>
            <view
                bindtap={() => {nav(-1)}}
                style={{
                    width: '100%',
                    height: '100%',
                    color: 'white',
                    paddingTop:
                    (lynx.__globalProps as GlobalProps)?.['safeAreaTop'] ?? '0px',
                }}
            >
                <text>Test Component</text>
            </view>
        </>
    );
}
