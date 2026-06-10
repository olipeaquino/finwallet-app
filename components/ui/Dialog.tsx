import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react-native';
import { Button } from './Button';
import { AnimatedView } from './AnimatedView';
import { useThemeContext } from '@/providers';
import { colors, elevation } from '@/constants';
import { hapticService } from '@/services';

export type DialogActionStyle = 'default' | 'cancel' | 'destructive';

export interface DialogAction {
    text: string;
    onPress?: () => void;
    style?: DialogActionStyle;
}

export type DialogTone = 'default' | 'danger' | 'success' | 'warning' | 'info';

export interface DialogOptions {
    title: string;
    message?: string;
    actions?: DialogAction[];
    tone?: DialogTone;
}

let showHandler: ((opts: DialogOptions) => void) | null = null;

export function showDialog(opts: DialogOptions) {
    if (showHandler) showHandler(opts);
}

export function showAlert(
    title: string,
    message?: string,
    buttons?: DialogAction[],
    extra?: { tone?: DialogTone }
) {
    showDialog({ title, message, actions: buttons, tone: extra?.tone });
}

const TONES: Record<DialogTone, { color: string; Icon: typeof Info }> = {
    default: { color: colors.primary[500], Icon: Info },
    danger: { color: colors.error, Icon: AlertTriangle },
    success: { color: colors.success, Icon: CheckCircle2 },
    warning: { color: colors.warning, Icon: AlertTriangle },
    info: { color: colors.info, Icon: Info },
};

export function DialogHost() {
    const { isDark } = useThemeContext();
    const [opts, setOpts] = useState<DialogOptions | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        showHandler = (o: DialogOptions) => {
            setOpts(o);
            setVisible(true);
            const hasDestructive = o.actions?.some((a) => a.style === 'destructive');
            if (o.tone === 'danger' || o.tone === 'warning' || hasDestructive) {
                hapticService.warning();
            } else if (o.tone === 'success') {
                hapticService.success();
            } else {
                hapticService.light();
            }
        };
        return () => {
            showHandler = null;
        };
    }, []);

    const dismiss = useCallback((onPress?: () => void) => {
        setVisible(false);
        if (onPress) setTimeout(onPress, 10);
    }, []);

    if (!opts) return null;

    const tone: DialogTone =
        opts.tone ?? (opts.actions?.some((a) => a.style === 'destructive') ? 'danger' : 'default');
    const { color, Icon } = TONES[tone];

    const actions: DialogAction[] =
        opts.actions && opts.actions.length > 0
            ? opts.actions
            : [{ text: 'OK', style: 'default' }];

    const ordered = [
        ...actions.filter((a) => a.style !== 'cancel'),
        ...actions.filter((a) => a.style === 'cancel'),
    ];
    const cancelAction = actions.find((a) => a.style === 'cancel');

    const onBackdrop = () => dismiss(cancelAction?.onPress);

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onBackdrop}
            statusBarTranslucent
        >
            <Pressable
                onPress={onBackdrop}
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.55)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                }}
            >
                <AnimatedView animation="fadeInUp" duration={220} style={{ width: '100%', maxWidth: 360 }}>
                    <Pressable
                        onPress={() => { }}
                        style={[
                            {
                                borderRadius: 28,
                                padding: 24,
                                backgroundColor: isDark ? colors.dark.surface : colors.light.surface,
                            },
                            elevation.xl,
                        ]}
                    >
                        <View
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 18,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: color + '1A',
                                marginBottom: 16,
                            }}
                        >
                            <Icon color={color} size={28} />
                        </View>

                        <Text
                            className="font-inter-bold text-text-primary-light dark:text-text-primary-dark"
                            style={{ fontSize: 20, letterSpacing: -0.3 }}
                        >
                            {opts.title}
                        </Text>

                        {opts.message ? (
                            <Text
                                className="font-inter-regular text-text-secondary-light dark:text-text-secondary-dark"
                                style={{ fontSize: 15, lineHeight: 22, marginTop: 8 }}
                            >
                                {opts.message}
                            </Text>
                        ) : null}

                        <View style={{ marginTop: 24, gap: 10 }}>
                            {ordered.map((a, i) => {
                                const variant =
                                    a.style === 'destructive'
                                        ? 'destructive'
                                        : a.style === 'cancel'
                                            ? 'secondary'
                                            : 'primary';
                                return (
                                    <Button
                                        key={`${a.text}-${i}`}
                                        variant={variant as any}
                                        size="md"
                                        fullWidth
                                        onPress={() => dismiss(a.onPress)}
                                    >
                                        {a.text}
                                    </Button>
                                );
                            })}
                        </View>
                    </Pressable>
                </AnimatedView>
            </Pressable>
        </Modal>
    );
}
