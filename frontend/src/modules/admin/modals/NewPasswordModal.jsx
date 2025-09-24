import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";

export default function NewPasswordModal({ isOpen, onClose, password }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New Password</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <Text>Copy this password and give it to the user:</Text>
            <Input value={password} isReadOnly />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} colorScheme="blue">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
