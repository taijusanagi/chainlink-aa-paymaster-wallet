import {
  Modal as _Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import React from "react";

export interface GeneralModalProps {
  header: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export interface FullModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export const GeneralModal: React.FC<GeneralModalProps> = ({ header, children, isOpen, onClose }) => {
  return (
    <_Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent m="2">
        <ModalHeader>
          {header && (
            <Text fontSize="sm" color={"gray.600"}>
              {header}
            </Text>
          )}
          <ModalCloseButton color={"gray.600"} />
        </ModalHeader>
        <ModalBody px="6" pt="2" pb="8">
          {children}
        </ModalBody>
      </ModalContent>
    </_Modal>
  );
};

export const FullModal: React.FC<FullModalProps> = ({ children, isOpen, onClose }) => {
  return (
    <_Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent m="2" bgColor={"inherit"}>
        <ModalCloseButton color={"gray.600"} zIndex="10" />
        {children}
      </ModalContent>
    </_Modal>
  );
};
