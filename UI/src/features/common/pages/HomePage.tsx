import { Box, Button, Typography, AppBar, Container, Paper, Grid } from '@mui/material';
import { Palette } from '@mui/icons-material';

export const HomePage = () => (
    <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="primary" elevation={1}>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
            <Paper
                elevation={4}
                sx={{ p: 4, borderRadius: 4, backgroundColor: 'background.paper' }}
            >
                <Typography
                    variant="h3"
                    gutterBottom
                    sx={{ fontWeight: 700, color: 'primary.main' }}
                >
                    🚀 Welcome Gúy
                </Typography>
                <Typography variant="h5" sx={{ mt: 5, mb: 2, fontWeight: 500 }}>
                    <Palette sx={{ mb: -0.5, mr: 1, color: 'secondary.main' }} />
                    Theme Palette
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Button fullWidth variant="contained" color="primary">
                            Primary
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Button fullWidth variant="contained" color="secondary">
                            Secondary
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Button fullWidth variant="contained" color="warning">
                            Accent
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Button fullWidth variant="outlined" color="primary">
                            Text Color
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    </Box>
);
