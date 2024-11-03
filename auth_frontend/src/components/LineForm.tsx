import {
  Accessor,
  Component,
  Index,
  JSX,
  createEffect,
  createSignal,
} from "solid-js";
import { Input, InputProps } from "./Input";

interface Field {
  name: string;
  label: string;
  validator: (val: string) => string;
  cache?: boolean;
  type?: string;
  autocomplete?: string;
}

interface LineFormProps {
  fields: Field[];
  children?: JSX.Element;
  onSubmit: (fields: { [key: string]: string }) => void;
}

export const LineForm: Component<LineFormProps> = (props) => {
  const createInput = () => {
    const [value, setValue] = createSignal(""),
      [error, setError] = createSignal(""),
      [ref, setRef] = createSignal<HTMLInputElement>();
    return { value, setValue, error, setError, ref, setRef };
  };

  const formData = props.fields.reduce(
    (obj: { [key: string]: ReturnType<typeof createInput> }, field, index) => {
      obj[field.name] = createInput();
      if (field.cache) {
        obj[field.name].setValue(
          localStorage.getItem(`formCache.${field.name}`) ?? "",
        );
      }
      createEffect(() => {
        localStorage.setItem(
          `formCache.${field.name}`,
          obj[field.name].value(),
        );
      });
      return obj;
    },
    {},
  );

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    let hasError = props.fields.reduce((hasError, field) => {
      const error = field.validator(formData[field.name].value());
      formData[field.name].setError(error);
      return hasError || error.length > 0;
    }, false);
    if (hasError) {
      return;
    }
    await props.onSubmit(props.fields.reduce(
      (obj: { [key: string]: string }, field) => {
        obj[field.name] = formData[field.name].value();
        return obj;
      },
      {},
    ));
    props.fields.forEach((field) => {
      const error = field.validator(formData[field.name].value());
      formData[field.name].setError(error);
    });
  };

  const handleKeyPressFactory = (ref: Accessor<HTMLElement | undefined>) => {
    return (e: KeyboardEvent) => {
      if (e.key != "Enter") {
        return;
      }
      e.preventDefault();
      ref()!.focus();
    };
  };

  let autofocusId = 0;
  const inputProps = (field: Field, i: number) => {
    let res: InputProps = {
      name: field.name,
      label: field.label,
      value: formData[field.name].value,
      setValue: formData[field.name].setValue,
      error: formData[field.name].error,
      setError: formData[field.name].setError,
      ref: formData[field.name].setRef,
      type: field.type ?? "text",
      autocomplete: field.autocomplete,
    };
    if (i === autofocusId) {
      if (res.value().length > 0 && i < props.fields.length - 1) {
        autofocusId++;
      } else {
        res.autofocus = true;
      }
    }
    if (i < props.fields.length - 1) {
      res.onKeyPress = handleKeyPressFactory(
        formData[props.fields[i + 1].name].ref,
      );
    }
    return res;
  };

  return (
    <form class="flex flex-col" onSubmit={handleSubmit}>
      <Index each={props.fields}>
        {(field, i) => <Input {...inputProps(field(), i)} />}
      </Index>
      {props.children}
    </form>
  );
};
