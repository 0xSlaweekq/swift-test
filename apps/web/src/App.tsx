import { yupResolver } from "@hookform/resolvers/yup"
import {
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material"
import axios from "axios";
import React from "react"
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup"

interface Config {
  name: string;
  title: string;
  description: string;
  parameters: {
    input: {
      type: string;
      name: string;
      title: string;
      items?: { value: string; title: string }[];
    }[];
    output: { type: string; name: string; title: string }[];
  };
}

const App = () => {
  const socketRef = React.useRef<WebSocket | null>(null);
  const [config, setConfig] = React.useState<Config | null>(null);
  const [result, setResult] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [taskStatus, setTaskStatus] = React.useState<string>("");

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.hostname; // Динамически получаем хост
  const apiUrl = `${window.location.protocol}://${host}:9002/api`;
  const wsUrl = `${protocol}://${host}:9003`;

  React.useEffect(() => {
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => console.log("WebSocket подключён!");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Получено сообщение от сервера:", data);

        if (data.type === "task-status") {
          setTaskStatus(`${data.status} (${data.jobId})`);
          if (data.status === "completed") {
            setResult(data.result);
          }
        }
      } catch (err) {
        console.error("Ошибка при обработке WebSocket сообщения", err);
      }
    };

    ws.onerror = (err) => console.error("Ошибка WebSocket", err);
    ws.onclose = () => console.log("WebSocket отключён!");

    return () => {
      ws.close();
      console.log("WebSocket соединение закрыто");
    };
  }, []);

  React.useEffect(() => {
    axios
      .get(`${apiUrl}/config`)
      .then((res) => setConfig(res.data))
      .catch(() => setError("Ошибка загрузки конфигурации"));
  }, []);

  const schema = yup.object().shape({
    inputNum: yup.number().required("Введите число"),
    inputText: yup.string().required("Выберите значение"),
  });

  const { handleSubmit, control } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(`${apiUrl}/start`, data);
      setTaskStatus(`Задача отправлена:\n${res.data}`);
    } catch (e) {
      setError(`Ошибка выполнения команды: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4">{config?.title}</Typography>
      <Typography variant="body1">{config?.description}</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit(onSubmit)();
        }}
        style={{ marginTop: 20 }}
      >
        {config?.parameters.input.map((param) => (
          <Box key={param.name} sx={{ mb: 2 }}>
            <Typography>{param.title}</Typography>
            <Controller
              name={param.name as "inputNum" | "inputText"}
              control={control}
              defaultValue={param.items?.[0]?.value || ""}
              render={({ field }) =>
                param.type === "number" ? (
                  <TextField type="number" {...field} fullWidth />
                ) : (
                  <Select {...field} fullWidth>
                    {param.items?.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.title}
                      </MenuItem>
                    ))}
                  </Select>
                )
              }
            />
          </Box>
        ))}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Запустить"}
        </Button>
      </form>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Статус задачи:
        {taskStatus.split("\n").map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </Typography>
      {result && (
        <Box sx={{ mt: 3, p: 2, bgcolor: "#f4f4f4", borderRadius: 1 }}>
          <Typography variant="h6">Результат:</Typography>
          <Typography component="pre">{result}</Typography>
        </Box>
      )}
    </Container>
  );
}

export default App
