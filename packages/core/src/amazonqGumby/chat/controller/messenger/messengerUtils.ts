/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 */

import * as os from 'os'
import { transformByQState, JDKVersion } from '../../../../codewhisperer/models/model'
import * as CodeWhispererConstants from '../../../../codewhisperer/models/constants'

// These enums map to string IDs
export enum ButtonActions {
    STOP_TRANSFORMATION_JOB = 'gumbyStopTransformationJob',
    VIEW_TRANSFORMATION_HUB = 'gumbyViewTransformationHub',
    CONFIRM_TRANSFORMATION_FORM = 'gumbyTransformFormConfirm',
    CANCEL_TRANSFORMATION_FORM = 'gumbyTransformFormCancel',
    CONFIRM_JAVA_HOME_FORM = 'gumbyJavaHomeFormConfirm',
    CANCEL_JAVA_HOME_FORM = 'gumbyJavaHomeFormCancel',
    CONFIRM_START_TRANSFORMATION_FLOW = 'gumbyStartTransformation',
}

export enum GumbyCommands {
    CLEAR_CHAT = 'aws.awsq.clearchat',
    START_TRANSFORMATION_FLOW = 'aws.awsq.transform',
    FOCUS_TRANSFORMATION_HUB = 'aws.amazonq.showTransformationHub',
}

export default class MessengerUtils {
    static createJavaHomePrompt = (): string => {
        let javaHomePrompt = `${
            CodeWhispererConstants.enterJavaHomeChatMessage
        } ${transformByQState.getSourceJDKVersion()}. \n`
        if (os.platform() === 'win32') {
            javaHomePrompt += CodeWhispererConstants.windowsJavaHomeHelpChatMessage.replace(
                'JAVA_VERSION_HERE',
                transformByQState.getSourceJDKVersion()!
            )
        } else {
            const jdkVersion = transformByQState.getSourceJDKVersion()
            if (jdkVersion === JDKVersion.JDK8) {
                javaHomePrompt += ` ${CodeWhispererConstants.nonWindowsJava8HomeHelpChatMessage}`
            } else if (jdkVersion === JDKVersion.JDK11) {
                javaHomePrompt += ` ${CodeWhispererConstants.nonWindowsJava11HomeHelpChatMessage}`
            }
        }
        return javaHomePrompt
    }

    static stringToEnumValue = <T extends { [key: string]: string }, K extends keyof T & string>(
        enumObject: T,
        value: `${T[K]}`
    ): T[K] => {
        if (Object.values(enumObject).includes(value)) {
            return value as unknown as T[K]
        } else {
            throw new Error('Value provided was not found in Enum')
        }
    }

    static createTransformationConfirmationPrompt = (detectedJavaVersions: Array<JDKVersion | undefined>): string => {
        let javaVersionString = 'Java project'
        const uniqueJavaOptions = new Set(detectedJavaVersions)

        if (detectedJavaVersions.length > 1) {
            // this  means there is a Java version whose version we weren't able to determine
            if (uniqueJavaOptions.has(undefined)) {
                javaVersionString = 'Java projects'
            } else {
                javaVersionString = `Java ${Array.from(uniqueJavaOptions).join(' & ')} projects`
            }
        } else if (detectedJavaVersions.length === 1) {
            if (!uniqueJavaOptions.has(undefined)) {
                javaVersionString = `Java ${detectedJavaVersions[0]!.toString()} project`
            }
        }

        return CodeWhispererConstants.projectPromptChatMessage.replace('JAVA_VERSION_HERE', javaVersionString)
    }
}
